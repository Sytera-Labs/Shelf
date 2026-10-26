use crate::{LaunchPlan, Proc};
use std::ffi::c_void;
use std::process::{Command, Stdio};

/// Start the game outside this window. No shell program is started.
pub fn spawn_game(plan: &LaunchPlan) -> Option<(u32, String)> {
    if !std::path::Path::new(&plan.file).exists() {
        return None;
    }
    direct_launch(plan).or_else(|| shell_launch(plan))
}

/// Process list from Windows itself. Nothing else is started.
pub fn list_processes() -> Vec<Proc> {
    unsafe {
        let snap = CreateToolhelp32Snapshot(0x0000_0002, 0);
        if snap.is_null() || snap == (-1isize as *mut c_void) {
            return Vec::new();
        }
        let mut entry: PROCESSENTRY32W = std::mem::zeroed();
        entry.size = std::mem::size_of::<PROCESSENTRY32W>() as u32;
        let mut rows = Vec::new();
        if Process32FirstW(snap, &mut entry) != 0 {
            loop {
                let pid = entry.pid;
                if pid != 0 {
                    rows.push(Proc { pid, ppid: entry.parent, path: image_path(pid) });
                }
                entry.size = std::mem::size_of::<PROCESSENTRY32W>() as u32;
                if Process32NextW(snap, &mut entry) == 0 {
                    break;
                }
            }
        }
        CloseHandle(snap);
        rows
    }
}

fn direct_launch(plan: &LaunchPlan) -> Option<(u32, String)> {
    use std::os::windows::process::CommandExt;
    const DETACHED_PROCESS: u32 = 0x0000_0008;
    const CREATE_NEW_PROCESS_GROUP: u32 = 0x0000_0200;
    const CREATE_BREAKAWAY_FROM_JOB: u32 = 0x0100_0000;
    let child = Command::new(&plan.file)
        .current_dir(&plan.cwd)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP | CREATE_BREAKAWAY_FROM_JOB)
        .spawn()
        .ok()?;
    Some((child.id(), plan.file.clone()))
}

fn shell_launch(plan: &LaunchPlan) -> Option<(u32, String)> {
    let file = wide(&plan.file);
    let dir = wide(&plan.cwd);
    let verb = wide("open");
    unsafe {
        let mut info: SHELLEXECUTEINFOW = std::mem::zeroed();
        info.size = std::mem::size_of::<SHELLEXECUTEINFOW>() as u32;
        info.mask = 0x0000_0040;
        info.verb = verb.as_ptr();
        info.file = file.as_ptr();
        info.directory = dir.as_ptr();
        info.show = 1;
        if ShellExecuteExW(&mut info) == 0 || info.process.is_null() {
            return None;
        }
        let pid = GetProcessId(info.process);
        CloseHandle(info.process);
        if pid == 0 {
            return None;
        }
        Some((pid, plan.file.clone()))
    }
}

fn image_path(pid: u32) -> String {
    unsafe {
        let handle = OpenProcess(0x1000, 0, pid);
        if handle.is_null() {
            return String::new();
        }
        let mut buf = [0u16; 1024];
        let mut len = buf.len() as u32;
        let ok = QueryFullProcessImageNameW(handle, 0, buf.as_mut_ptr(), &mut len);
        CloseHandle(handle);
        if ok == 0 {
            return String::new();
        }
        String::from_utf16_lossy(&buf[..len as usize])
    }
}

fn wide(text: &str) -> Vec<u16> {
    text.encode_utf16().chain(std::iter::once(0)).collect()
}

#[repr(C)]
struct PROCESSENTRY32W {
    size: u32,
    usage: u32,
    pid: u32,
    heap: usize,
    module: u32,
    threads: u32,
    parent: u32,
    pri: i32,
    flags: u32,
    exe: [u16; 260],
}

#[repr(C)]
struct SHELLEXECUTEINFOW {
    size: u32,
    mask: u32,
    hwnd: *mut c_void,
    verb: *const u16,
    file: *const u16,
    parameters: *const u16,
    directory: *const u16,
    show: i32,
    inst_app: *mut c_void,
    id_list: *mut c_void,
    class_name: *const u16,
    class_key: *mut c_void,
    hot_key: u32,
    monitor: *mut c_void,
    process: *mut c_void,
}

#[link(name = "kernel32")]
extern "system" {
    fn CreateToolhelp32Snapshot(flags: u32, pid: u32) -> *mut c_void;
    fn Process32FirstW(snap: *mut c_void, entry: *mut PROCESSENTRY32W) -> i32;
    fn Process32NextW(snap: *mut c_void, entry: *mut PROCESSENTRY32W) -> i32;
    fn OpenProcess(access: u32, inherit: i32, pid: u32) -> *mut c_void;
    fn QueryFullProcessImageNameW(process: *mut c_void, flags: u32, name: *mut u16, size: *mut u32) -> i32;
    fn GetProcessId(process: *mut c_void) -> u32;
    fn CloseHandle(handle: *mut c_void) -> i32;
}

#[link(name = "shell32")]
extern "system" {
    fn ShellExecuteExW(info: *mut SHELLEXECUTEINFOW) -> i32;
}
