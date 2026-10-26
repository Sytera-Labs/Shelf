use shelf_core::{catalog_file, launch_plan, note_sample, Proc, Store, WatchState};
use serde::Deserialize;
use serde_json::{json, Value};
use std::io::{BufRead, BufReader, Write};
#[cfg(windows)]
use shelf_core::{list_processes, spawn_game};
use std::sync::mpsc::{self, Sender};
use std::sync::{Mutex, OnceLock};
#[cfg(windows)]
use std::collections::HashMap;
#[cfg(windows)]
use std::sync::atomic::{AtomicU64, Ordering};
#[cfg(windows)]
use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[cfg(windows)]
fn now_ms() -> u128 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0)
}

fn stdout_tx() -> &'static Mutex<Sender<String>> {
    static TX: OnceLock<Mutex<Sender<String>>> = OnceLock::new();
    TX.get_or_init(|| {
        let (tx, rx) = mpsc::channel::<String>();
        std::thread::spawn(move || {
            let mut out = std::io::stdout().lock();
            while let Ok(line) = rx.recv() {
                let _ = writeln!(out, "{line}");
                let _ = out.flush();
            }
        });
        Mutex::new(tx)
    })
}

fn emit(value: &Value) {
    if let Ok(line) = serde_json::to_string(value) {
        if let Ok(tx) = stdout_tx().lock() {
            let _ = tx.send(line);
        }
    }
}

#[cfg(windows)]
fn generations() -> &'static Mutex<HashMap<String, u64>> {
    static GEN: OnceLock<Mutex<HashMap<String, u64>>> = OnceLock::new();
    GEN.get_or_init(|| Mutex::new(HashMap::new()))
}

#[cfg(windows)]
static TICK: AtomicU64 = AtomicU64::new(1);

#[derive(Debug, Deserialize)]
struct In {
    id: u64,
    op: String,
    #[serde(default)]
    key: String,
    #[serde(default)]
    value: String,
    #[serde(default)]
    file: String,
    state: Option<WatchState>,
    #[serde(default)]
    rows: Vec<Proc>,
    #[serde(default)]
    now: u128,
}

fn serve(exe: &str) {
    let _ = stdout_tx();
    let store = Mutex::new(Store::open(catalog_file(exe)));
    let stdin = BufReader::new(std::io::stdin());
    for line in stdin.lines() {
        let Ok(line) = line else { break };
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        let Ok(req) = serde_json::from_str::<In>(trimmed) else {
            emit(&json!({"ok": false, "error": "bad request"}));
            continue;
        };
        let reply = match req.op.as_str() {
            "get" => {
                let value = store.lock().ok().and_then(|s| s.get(&req.key));
                json!({"id": req.id, "ok": true, "value": value})
            }
            "set" => {
                let ok = store.lock().map(|mut s| s.set(req.key, req.value)).unwrap_or(false);
                json!({"id": req.id, "ok": ok})
            }
            "remove" => {
                let ok = store.lock().map(|mut s| s.remove(&req.key)).unwrap_or(false);
                json!({"id": req.id, "ok": ok})
            }
            "plan" => json!({"id": req.id, "ok": true, "plan": launch_plan(&req.file)}),
            "sample" => match req.state {
                Some(state) => {
                    let next = note_sample(state, &req.rows, req.now);
                    json!({"id": req.id, "ok": true, "state": next})
                }
                None => json!({"id": req.id, "ok": false}),
            },
            "play" => {
                let started = play(&req.file);
                json!({"id": req.id, "ok": true, "started": started})
            }
            _ => json!({"id": req.id, "ok": false, "error": "unknown"}),
        };
        emit(&reply);
    }
}

fn play(file: &str) -> bool {
    let Some(plan) = launch_plan(file) else { return false };
    #[cfg(not(windows))]
    {
        let _ = plan;
        return false;
    }
    #[cfg(windows)]
    {
        let Some((pid, file)) = spawn_game(&plan) else { return false };
        watch(pid, file);
        true
    }
}

#[cfg(windows)]
fn watch(root_pid: u32, file: String) {
    let key = file.to_lowercase();
    let gen = TICK.fetch_add(1, Ordering::Relaxed);
    if let Ok(mut map) = generations().lock() {
        map.insert(key.clone(), gen);
    }
    std::thread::spawn(move || {
        let mut state = WatchState {
            tracked: std::collections::BTreeSet::from([root_pid]),
            misses: 0,
            started_at: now_ms(),
            file: file.clone(),
            stop: false,
        };
        if root_pid == 0 {
            state.tracked.clear();
        }
        loop {
            std::thread::sleep(Duration::from_secs(1));
            let current = generations().lock().ok().and_then(|map| map.get(&key).copied());
            if current != Some(gen) {
                break;
            }
            let rows = list_processes();
            state = note_sample(state, &rows, now_ms());
            if state.stop {
                emit(&json!({"event": "exe-exit", "file": file}));
                break;
            }
        }
    });
}

fn main() {
    let mut args = std::env::args().skip(1);
    match args.next().as_deref() {
        Some("catalog") => {
            let exe = args.next().unwrap_or_default();
            match catalog_file(&exe) {
                Some(path) => println!("{path}"),
                None => println!("null"),
            }
        }
        Some("plan") => {
            let file = args.next().unwrap_or_default();
            match launch_plan(&file) {
                Some(plan) => println!("{}", serde_json::to_string(&plan).unwrap_or_else(|_| "null".into())),
                None => println!("null"),
            }
        }
        Some("serve") => {
            let mut exe = String::new();
            while let Some(arg) = args.next() {
                if arg == "--exe" {
                    exe = args.next().unwrap_or_default();
                }
            }
            serve(&exe);
        }
        _ => {
            eprintln!("shelf-core catalog <exe> | plan <file> | serve --exe <exe>");
            std::process::exit(2);
        }
    }
}
