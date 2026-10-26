use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Proc {
    pub pid: u32,
    pub ppid: u32,
    #[serde(default)]
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WatchState {
    pub tracked: BTreeSet<u32>,
    pub misses: u32,
    #[serde(rename = "startedAt")]
    pub started_at: u128,
    pub file: String,
    pub stop: bool,
}

pub fn same_exe(a: &str, b: &str) -> bool {
    norm(a) == norm(b)
}

fn norm(value: &str) -> String {
    value.trim().replace('/', "\\").trim_end_matches('\\').to_lowercase()
}

/// The launched process and anything it started.
pub fn absorb_tree(tracked: &BTreeSet<u32>, rows: &[Proc]) -> BTreeSet<u32> {
    let mut next = tracked.clone();
    let mut grew = true;
    while grew {
        grew = false;
        for row in rows {
            if row.pid == 0 || !next.contains(&row.ppid) || next.contains(&row.pid) {
                continue;
            }
            next.insert(row.pid);
            grew = true;
        }
    }
    next
}

/// One sample of the process list.
/// An empty list is ignored. The first 1.5s never stop the clock.
/// Two misses after that do.
pub fn note_sample(state: WatchState, rows: &[Proc], now: u128) -> WatchState {
    if rows.is_empty() {
        return WatchState { stop: false, ..state };
    }
    let mut tracked = absorb_tree(&state.tracked, rows);
    for row in rows {
        if !row.path.is_empty() && same_exe(&row.path, &state.file) {
            tracked.insert(row.pid);
        }
    }
    let alive = rows.iter().any(|row| tracked.contains(&row.pid));
    if alive || now.saturating_sub(state.started_at) < 1500 {
        return WatchState { tracked, misses: 0, started_at: state.started_at, file: state.file, stop: false };
    }
    let misses = state.misses.saturating_add(1);
    WatchState { tracked, misses, started_at: state.started_at, file: state.file, stop: misses >= 2 }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn proc(pid: u32, ppid: u32, path: &str) -> Proc {
        Proc { pid, ppid, path: path.to_string() }
    }

    #[test]
    fn clock_follows_the_process_tree() {
        let file = r"E:\Games\Delaware St John Volume 1\DSJV1.exe";
        let base = WatchState {
            tracked: BTreeSet::from([10]),
            misses: 0,
            started_at: 0,
            file: file.to_string(),
            stop: false,
        };
        assert!(same_exe(file, "e:/games/delaware st john volume 1/dsjv1.exe"));
        assert!(!same_exe(file, r"E:\Games\Other.exe"));

        let tree = absorb_tree(
            &BTreeSet::from([10]),
            &[
                proc(11, 10, r"E:\Games\Delaware St John Volume 1\game.exe"),
                proc(12, 11, ""),
                proc(99, 1, ""),
            ],
        );
        assert_eq!(tree.into_iter().collect::<Vec<_>>(), vec![10, 11, 12]);

        let child_only = note_sample(
            WatchState { tracked: BTreeSet::from([10, 11, 12]), ..base.clone() },
            &[proc(12, 4, "")],
            10_000,
        );
        assert!(!child_only.stop);
        assert_eq!(child_only.misses, 0);

        let by_path = note_sample(base.clone(), &[proc(40, 4, "E:/Games/Delaware St John Volume 1/DSJV1.exe")], 10_000);
        assert!(!by_path.stop);
        assert!(by_path.tracked.contains(&40));

        let grace = note_sample(base.clone(), &[proc(1, 0, r"C:\Windows\explorer.exe")], 500);
        assert!(!grace.stop);
        assert_eq!(grace.misses, 0);

        let one = note_sample(base.clone(), &[proc(1, 0, r"C:\Windows\explorer.exe")], 10_000);
        assert!(!one.stop);
        assert_eq!(one.misses, 1);
        let two = note_sample(one.clone(), &[proc(1, 0, r"C:\Windows\explorer.exe")], 11_000);
        assert!(two.stop);

        let blank = note_sample(one.clone(), &[], 11_000);
        assert!(!blank.stop);
        assert_eq!(blank.misses, 1);

        let back = note_sample(one, &[proc(10, 1, file)], 11_000);
        assert_eq!(back.misses, 0);
        assert!(!back.stop);
    }
}
