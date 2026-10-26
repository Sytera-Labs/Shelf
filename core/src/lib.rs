mod catalog;
mod launch;
mod library;
mod store;
mod watch;

pub use catalog::catalog_file;
pub use launch::{launch_plan, LaunchPlan, POWERSHELL};
pub use library::{format_exact, now_ms, session_seconds, Draft, Library, STORE_KEY};
pub use store::Store;
pub use watch::{absorb_tree, note_sample, same_exe, Proc, WatchState};

#[cfg(windows)]
mod play;
#[cfg(windows)]
pub use play::{list_processes, spawn_game};
