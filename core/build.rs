use std::fs;
use std::path::Path;

fn main() {
    println!("cargo:rerun-if-changed=ui");
    let out = std::env::var("OUT_DIR").unwrap();
    let mut items = String::new();
    let ui = Path::new("ui");
    if ui.is_dir() {
        walk(ui, &mut items);
    }
    let body = format!(
        "pub struct Packed {{ pub path: &'static str, pub kind: &'static str, pub bytes: &'static [u8] }}\n\
         pub static PACKED: &[Packed] = &[{items}];\n"
    );
    fs::write(Path::new(&out).join("assets.rs"), body).unwrap();
    if std::env::var("CARGO_CFG_TARGET_OS").ok().as_deref() == Some("windows") {
        let rc_path = Path::new(&out).join("shelf.rc");
        let res_path = Path::new(&out).join("shelf-icon.res");
        let icon = std::fs::canonicalize("assets/shelf.ico").expect("icon");
        let icon = icon.to_string_lossy().replace('\\', "/");
        fs::write(&rc_path, format!("1 ICON \"{icon}\"\n")).unwrap();
        let status = std::process::Command::new("/tmp/llvm-mingw/bin/x86_64-w64-mingw32-windres")
            .args(["--input", rc_path.to_str().unwrap(), "--output", res_path.to_str().unwrap(), "--output-format", "coff"])
            .status()
            .expect("windres");
        if !status.success() {
            panic!("icon resource was not built");
        }
        println!("cargo:rustc-link-arg={}", res_path.display());
        println!("cargo:rerun-if-changed=assets/shelf.ico");
    }
}

fn walk(dir: &Path, out: &mut String) {
    let entries = match fs::read_dir(dir) {
        Ok(entries) => entries,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            walk(&path, out);
            continue;
        }
        let rel = path.strip_prefix("ui").unwrap_or(&path).to_string_lossy().replace('\\', "/");
        let url = format!("/{rel}");
        let kind = mime(&url);
        let full = std::fs::canonicalize(&path).unwrap_or(path.clone());
        let full = full.to_string_lossy().replace('\\', "/");
        out.push_str(&format!(
            "Packed {{ path: \"{url}\", kind: \"{kind}\", bytes: include_bytes!(\"{full}\") }},\n"
        ));
    }
}

fn mime(path: &str) -> &'static str {
    if path.ends_with(".html") {
        "text/html; charset=utf-8"
    } else if path.ends_with(".js") {
        "text/javascript; charset=utf-8"
    } else if path.ends_with(".css") {
        "text/css; charset=utf-8"
    } else if path.ends_with(".svg") {
        "image/svg+xml"
    } else if path.ends_with(".png") {
        "image/png"
    } else if path.ends_with(".woff2") {
        "font/woff2"
    } else if path.ends_with(".ttf") {
        "font/ttf"
    } else {
        "application/octet-stream"
    }
}
