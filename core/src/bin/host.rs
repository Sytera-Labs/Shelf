//! Shows the shelf page in this program's window. The page is local.
//! Catalog, launch and the clock stay in the Rust core. Nothing is sent out.

use shelf_core::{catalog_file, launch_plan, list_processes, note_sample, now_ms, spawn_game, WatchState, STORE_KEY, Store};
use std::collections::BTreeSet;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::{Mutex, OnceLock};
use std::time::Duration;

include!(concat!(env!("OUT_DIR"), "/assets.rs"));

struct Runtime {
    catalog: String,
    watch: Option<WatchState>,
    exits: Vec<String>,
}

fn runtime() -> &'static Mutex<Runtime> {
    static RUNTIME: OnceLock<Mutex<Runtime>> = OnceLock::new();
    RUNTIME.get_or_init(|| {
        let exe = std::env::current_exe().ok().map(|path| path.to_string_lossy().to_string()).unwrap_or_default();
        Mutex::new(Runtime { catalog: catalog_file(&exe).unwrap_or_else(|| "shelf-data.json".into()), watch: None, exits: Vec::new() })
    })
}

pub fn open() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("local shelf");
    let port = listener.local_addr().expect("local shelf").port();
    listener.set_nonblocking(false).ok();
    std::thread::spawn(move || serve(listener));
    let url = format!("http://127.0.0.1:{port}/");
    open_window(&url);
}

fn serve(listener: TcpListener) {
    for stream in listener.incoming().flatten() {
        let _ = stream.set_read_timeout(Some(Duration::from_secs(8)));
        let _ = handle(stream);
    }
}

fn handle(mut stream: std::net::TcpStream) -> std::io::Result<()> {
    let mut buf = Vec::new();
    let mut tmp = [0u8; 8192];
    let header_end;
    loop {
        let n = stream.read(&mut tmp)?;
        if n == 0 {
            return Ok(());
        }
        buf.extend_from_slice(&tmp[..n]);
        if let Some(pos) = find_header(&buf) {
            header_end = pos;
            break;
        }
        if buf.len() > 1024 * 1024 {
            return Ok(());
        }
    }
    let head = String::from_utf8_lossy(&buf[..header_end]).to_string();
    let mut lines = head.split("\r\n");
    let request = lines.next().unwrap_or("");
    let mut parts = request.split(' ');
    let method = parts.next().unwrap_or("GET");
    let target = parts.next().unwrap_or("/");
    let mut length = 0usize;
    for line in lines {
        let lower = line.to_ascii_lowercase();
        if let Some(value) = lower.strip_prefix("content-length:") {
            length = value.trim().parse().unwrap_or(0);
        }
    }
    if length > 32 * 1024 * 1024 {
        reply(&mut stream, "413 Payload Too Large", "text/plain; charset=utf-8", b"")?;
        return Ok(());
    }
    let mut body = buf[header_end + 4..].to_vec();
    while body.len() < length {
        let n = stream.read(&mut tmp)?;
        if n == 0 {
            break;
        }
        body.extend_from_slice(&tmp[..n]);
    }
    body.truncate(length);
    let path = target.split('?').next().unwrap_or("/");
    if path.starts_with("/__shelf/") {
        shelf_api(&mut stream, method, target, &body)?;
        return Ok(());
    }
    let file = if path == "/" { "/shelf.html" } else { path };
    if let Some(packed) = PACKED.iter().find(|item| item.path == file) {
        reply(&mut stream, "200 OK", packed.kind, packed.bytes)?;
    } else {
        reply(&mut stream, "404 Not Found", "text/plain; charset=utf-8", b"")?;
    }
    Ok(())
}

fn shelf_api(stream: &mut std::net::TcpStream, method: &str, target: &str, body: &[u8]) -> std::io::Result<()> {
    let path = target.split('?').next().unwrap_or("");
    if path == "/__shelf/item" {
        let key = query_value(target, "key").unwrap_or_default();
        if key.is_empty() || key.len() > 80 {
            return reply(stream, "400 Bad Request", "text/plain; charset=utf-8", b"");
        }
        let runtime = runtime().lock().expect("shelf");
        let mut store = Store::open(Some(runtime.catalog.clone()));
        drop(runtime);
        if method == "PUT" {
            let text = String::from_utf8_lossy(body).to_string();
            let _ = store.set(key, text);
            return reply(stream, "204 No Content", "text/plain; charset=utf-8", b"");
        }
        if method == "DELETE" {
            let _ = store.remove(&key);
            return reply(stream, "204 No Content", "text/plain; charset=utf-8", b"");
        }
        return match store.get(&key) {
            Some(text) => reply(stream, "200 OK", "text/plain; charset=utf-8", text.as_bytes()),
            None => reply(stream, "204 No Content", "text/plain; charset=utf-8", b""),
        };
    }
    if path == "/__shelf/pick" && method == "POST" {
        return match pick_program() {
            Some(path) => reply(stream, "200 OK", "text/plain; charset=utf-8", path.as_bytes()),
            None => reply(stream, "204 No Content", "text/plain; charset=utf-8", b""),
        };
    }
    if path == "/__shelf/play" && method == "POST" {
        let file = String::from_utf8_lossy(body).trim().to_string();
        let Some(plan) = launch_plan(&file) else {
            return reply(stream, "422 Unprocessable Content", "text/plain; charset=utf-8", b"");
        };
        let Some((pid, image)) = spawn_game(&plan) else {
            return reply(stream, "422 Unprocessable Content", "text/plain; charset=utf-8", b"");
        };
        let mut runtime = runtime().lock().expect("shelf");
        runtime.watch = Some(WatchState {
            tracked: BTreeSet::from([pid]),
            misses: 0,
            started_at: now_ms() as u128,
            file: image,
            stop: false,
        });
        return reply(stream, "204 No Content", "text/plain; charset=utf-8", b"");
    }
    if path == "/__shelf/exited" {
        let mut runtime = runtime().lock().expect("shelf");
        if let Some(state) = runtime.watch.clone() {
            let next = note_sample(state, &list_processes(), now_ms() as u128);
            if next.stop {
                runtime.exits.push(next.file.clone());
                runtime.watch = None;
            } else {
                runtime.watch = Some(WatchState { stop: false, ..next });
            }
        }
        if runtime.exits.is_empty() {
            return reply(stream, "204 No Content", "text/plain; charset=utf-8", b"");
        }
        let path = runtime.exits.remove(0);
        return reply(stream, "200 OK", "text/plain; charset=utf-8", path.as_bytes());
    }
    let _ = STORE_KEY;
    reply(stream, "404 Not Found", "text/plain; charset=utf-8", b"")
}

fn query_value(target: &str, name: &str) -> Option<String> {
    let query = target.split_once('?')?.1;
    for pair in query.split('&') {
        let (key, value) = pair.split_once('=').unwrap_or((pair, ""));
        if decode(key) == name {
            return Some(decode(value));
        }
    }
    None
}

fn decode(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut out = Vec::new();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' && i + 2 < bytes.len() {
            if let Ok(byte) = u8::from_str_radix(&value[i + 1..i + 3], 16) {
                out.push(byte);
                i += 3;
                continue;
            }
        }
        if bytes[i] == b'+' {
            out.push(b' ');
        } else {
            out.push(bytes[i]);
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn reply(stream: &mut std::net::TcpStream, status: &str, kind: &str, body: &[u8]) -> std::io::Result<()> {
    let head = format!(
        "HTTP/1.1 {status}\r\nContent-Type: {kind}\r\nContent-Length: {}\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n",
        body.len()
    );
    stream.write_all(head.as_bytes())?;
    stream.write_all(body)?;
    Ok(())
}

fn find_header(buf: &[u8]) -> Option<usize> {
    buf.windows(4).position(|mark| mark == b"\r\n\r\n")
}

fn open_window(url: &str) {
    use tao::dpi::LogicalSize;
    use tao::event::{Event, WindowEvent};
    use tao::event_loop::{ControlFlow, EventLoop};
    use tao::window::WindowBuilder;
    use wry::{WebContext, WebViewBuilder};

    let event_loop = EventLoop::new();
    let window = WindowBuilder::new()
        .with_title("Shelf")
        .with_inner_size(LogicalSize::new(1280.0, 820.0))
        .with_window_icon(window_icon())
        .with_min_inner_size(LogicalSize::new(880.0, 560.0))
        .build(&event_loop)
        .expect("window");
    let data = webview_dir();
    let mut context = WebContext::new(Some(data));
    let origin = url.trim_end_matches('/').to_string();
    let allow = origin.clone();
    let web = WebViewBuilder::with_web_context(&mut context)
        .with_url(url)
        .with_background_color((5, 6, 7, 255))
        .with_navigation_handler(move |next| next == allow || next.starts_with(&format!("{allow}/")))
        .build(&window);
    if let Err(error) = web {
        tell(&format!("Окно полки не открылось.\n{error}"));
        return;
    }
    event_loop.run(move |event, _, control| {
        *control = ControlFlow::Wait;
        if let Event::WindowEvent { event: WindowEvent::CloseRequested, .. } = event {
            *control = ControlFlow::Exit;
        }
    });
}

fn window_icon() -> Option<tao::window::Icon> {
    tao::window::Icon::from_rgba(include_bytes!("../../assets/shelf-64.rgba").to_vec(), 64, 64).ok()
}

fn webview_dir() -> std::path::PathBuf {
    let exe = std::env::current_exe().ok();
    let folder = exe.as_ref().and_then(|path| path.parent()).map(|path| path.join("shelf-webview"));
    folder.unwrap_or_else(|| std::env::temp_dir().join("shelf-webview"))
}

fn tell(text: &str) {
    let message = wide(text);
    let title = wide("Shelf");
    unsafe { MessageBoxW(std::ptr::null_mut(), message.as_ptr(), title.as_ptr(), 0x10) };
}

fn pick_program() -> Option<String> {
    let mut file = [0u16; 520];
    let filter = wide("Programs\0*.exe\0All\0*.*\0");
    let def = wide("exe");
    let title = wide("Shelf");
    unsafe {
        let mut ofn: OPENFILENAMEW = std::mem::zeroed();
        ofn.struct_size = std::mem::size_of::<OPENFILENAMEW>() as u32;
        ofn.filter = filter.as_ptr();
        ofn.file = file.as_mut_ptr();
        ofn.max_file = file.len() as u32;
        ofn.flags = 0x1000 | 0x800 | 0x80000;
        ofn.def_ext = def.as_ptr();
        ofn.title = title.as_ptr();
        if GetOpenFileNameW(&mut ofn) == 0 {
            return None;
        }
    }
    let end = file.iter().position(|unit| *unit == 0).unwrap_or(file.len());
    let text = String::from_utf16_lossy(&file[..end]);
    if text.is_empty() { None } else { Some(text) }
}

fn wide(text: &str) -> Vec<u16> {
    text.encode_utf16().chain(std::iter::once(0)).collect()
}

#[repr(C)]
struct OPENFILENAMEW {
    struct_size: u32,
    owner: *mut std::ffi::c_void,
    instance: *mut std::ffi::c_void,
    filter: *const u16,
    custom_filter: *mut u16,
    max_custom: u32,
    filter_index: u32,
    file: *mut u16,
    max_file: u32,
    file_title: *mut u16,
    max_title: u32,
    initial_dir: *const u16,
    title: *const u16,
    flags: u32,
    file_offset: u16,
    file_extension: u16,
    def_ext: *const u16,
    cust_data: isize,
    hook: *mut std::ffi::c_void,
    template: *const u16,
    reserved: *mut std::ffi::c_void,
    reserved_dw: u32,
    flags_ex: u32,
}

#[link(name = "comdlg32")]
extern "system" {
    fn GetOpenFileNameW(ofn: *mut OPENFILENAMEW) -> i32;
}

#[link(name = "user32")]
extern "system" {
    fn MessageBoxW(owner: *mut std::ffi::c_void, text: *const u16, title: *const u16, kind: u32) -> i32;
}
