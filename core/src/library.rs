use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::time::{SystemTime, UNIX_EPOCH};

pub const STORE_KEY: &str = "polka.library.v2";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Game {
    pub id: String,
    pub title: String,
    pub exe_path: String,
    pub working_dir: String,
    pub args: String,
    #[serde(default)]
    pub cover: Option<String>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub folder_id: Option<String>,
    #[serde(default)]
    pub note: String,
    #[serde(default)]
    pub play_seconds: u64,
    #[serde(default)]
    pub last_played_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ShelfTag {
    pub name: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ShelfFolder {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub show_hours: bool,
    pub show_covers: bool,
    pub confirm_delete: bool,
    pub track_time: bool,
    pub motion: bool,
    pub medals_on: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            show_hours: true,
            show_covers: true,
            confirm_delete: true,
            track_time: true,
            motion: true,
            medals_on: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub game_id: String,
    pub started_at: u64,
    #[serde(default)]
    pub last_beat: u64,
    #[serde(default = "yes")]
    pub counting: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Library {
    pub games: Vec<Game>,
    pub folders: Vec<ShelfFolder>,
    pub tagbook: Vec<ShelfTag>,
    pub settings: Settings,
    pub did_seed: bool,
    pub session: Option<Session>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Draft {
    pub title: String,
    pub exe_path: String,
    pub tags: String,
    pub note: String,
}

impl Library {
    pub fn empty() -> Self {
        Self {
            games: Vec::new(),
            folders: Vec::new(),
            tagbook: Vec::new(),
            settings: Settings::default(),
            did_seed: true,
            session: None,
        }
    }

    /// Read the same file the previous window wrote. A saved session is closed
    /// at `now_ms`, using its last beat, so time is not left open forever.
    pub fn load(raw: Option<&str>, now_ms: u64) -> Self {
        let Some(raw) = raw else { return Self::empty() };
        let Ok(value) = serde_json::from_str::<Value>(raw) else { return Self::empty() };
        let state = value.get("state").cloned().unwrap_or(value);
        let mut lib = Self::from_state(&state);
        lib.settle(now_ms);
        lib
    }

    pub fn to_store_value(&self) -> String {
        let state = json!({
            "games": self.games,
            "folders": self.folders,
            "tagbook": self.tagbook,
            "settings": self.settings,
            "didSeed": self.did_seed,
            "session": self.session,
        });
        json!({ "state": state, "version": 0 }).to_string()
    }

    pub fn add(&mut self, draft: Draft, now_ms: u64) -> Result<String, ()> {
        let title = clean_title(&draft.title);
        if title.is_empty() {
            return Err(());
        }
        let now = iso_utc(now_ms);
        let tags = parse_tags(&draft.tags);
        self.merge_tags(&tags);
        let id = new_id(now_ms);
        let game = Game {
            id: id.clone(),
            title,
            exe_path: draft.exe_path.trim().to_string(),
            working_dir: String::new(),
            args: String::new(),
            cover: None,
            tags,
            folder_id: None,
            note: draft.note.trim().chars().take(2000).collect(),
            play_seconds: 0,
            last_played_at: None,
            created_at: now.clone(),
            updated_at: now,
        };
        self.games.insert(0, game);
        self.did_seed = true;
        Ok(id)
    }

    pub fn update(&mut self, id: &str, draft: Draft, now_ms: u64) -> Result<(), ()> {
        let title = clean_title(&draft.title);
        if title.is_empty() {
            return Err(());
        }
        let tags = parse_tags(&draft.tags);
        self.merge_tags(&tags);
        let now = iso_utc(now_ms);
        let Some(game) = self.games.iter_mut().find(|game| game.id == id) else { return Err(()) };
        game.title = title;
        game.exe_path = draft.exe_path.trim().to_string();
        game.tags = tags;
        game.note = draft.note.trim().chars().take(2000).collect();
        game.updated_at = now;
        Ok(())
    }

    pub fn remove(&mut self, id: &str) {
        self.games.retain(|game| game.id != id);
        if self.session.as_ref().is_some_and(|session| session.game_id == id) {
            self.session = None;
        }
    }

    pub fn start_session(&mut self, id: &str, now_ms: u64) -> bool {
        let Some(game) = self.games.iter().find(|game| game.id == id) else { return false };
        if game.exe_path.trim().is_empty() || !self.settings.track_time {
            return false;
        }
        if self.session.as_ref().is_some_and(|session| session.game_id == id) {
            return true;
        }
        self.settle(now_ms);
        self.session = Some(Session {
            game_id: id.to_string(),
            started_at: now_ms,
            last_beat: now_ms,
            counting: true,
        });
        true
    }

    pub fn stop_session(&mut self, now_ms: u64) {
        self.settle(now_ms);
    }

    pub fn shown_seconds(&self, game: &Game, now_ms: u64) -> u64 {
        let extra = self
            .session
            .as_ref()
            .filter(|session| session.counting && session.game_id == game.id)
            .map(|session| session_seconds(session.started_at, now_ms))
            .unwrap_or(0);
        game.play_seconds.saturating_add(extra)
    }

    pub fn visible(&self, query: &str) -> Vec<usize> {
        let q = query.trim().to_lowercase();
        self.games
            .iter()
            .enumerate()
            .filter(|(_, game)| q.is_empty() || game.title.to_lowercase().contains(&q))
            .map(|(index, _)| index)
            .collect()
    }

    fn settle(&mut self, now_ms: u64) {
        let Some(session) = self.session.take() else { return };
        if !session.counting {
            return;
        }
        let beat = if session.last_beat == 0 { session.started_at } else { session.last_beat };
        let ended = now_ms.min(beat);
        let elapsed = session_seconds(session.started_at, ended);
        let stamp = iso_utc(ended);
        if let Some(game) = self.games.iter_mut().find(|game| game.id == session.game_id) {
            game.play_seconds = game.play_seconds.saturating_add(elapsed);
            game.last_played_at = Some(stamp.clone());
            game.updated_at = stamp;
        }
    }

    fn merge_tags(&mut self, tags: &[String]) {
        for tag in tags {
            if self.tagbook.iter().any(|item| tag_key(&item.name) == tag_key(tag)) {
                continue;
            }
            self.tagbook.push(ShelfTag { name: tag.clone(), color: "#39c5bb".into() });
        }
    }

    fn from_state(state: &Value) -> Self {
        let games = state
            .get("games")
            .and_then(|v| serde_json::from_value::<Vec<Game>>(v.clone()).ok())
            .unwrap_or_default();
        let folders = state
            .get("folders")
            .and_then(|v| serde_json::from_value::<Vec<ShelfFolder>>(v.clone()).ok())
            .unwrap_or_default();
        let tagbook = state
            .get("tagbook")
            .and_then(|v| serde_json::from_value::<Vec<ShelfTag>>(v.clone()).ok())
            .unwrap_or_default();
        let settings = state
            .get("settings")
            .and_then(|v| serde_json::from_value::<Settings>(v.clone()).ok())
            .unwrap_or_default();
        let did_seed = state.get("didSeed").and_then(|v| v.as_bool()).unwrap_or(true);
        let session = state.get("session").and_then(|v| serde_json::from_value::<Session>(v.clone()).ok());
        let mut lib = Self { games, folders, tagbook, settings, did_seed, session };
        strip_samples(&mut lib);
        lib
    }

    /// True when every card in the old file is still loaded, or is one of the six demo cards.
    pub fn safe_to_rewrite(raw: &str, lib: &Library) -> bool {
        let Ok(value) = serde_json::from_str::<Value>(raw) else { return false };
        let state = value.get("state").cloned().unwrap_or(value);
        let Some(games) = state.get("games").and_then(|item| item.as_array()) else {
            return state.get("games").is_none();
        };
        let kept: std::collections::BTreeSet<&str> = lib.games.iter().map(|game| game.id.as_str()).collect();
        games.iter().all(|game| {
            let id = game.get("id").and_then(|item| item.as_str()).unwrap_or("");
            if id.is_empty() {
                return false;
            }
            if kept.contains(id) {
                return true;
            }
            let title = game.get("title").and_then(|item| item.as_str()).unwrap_or("");
            let exe = game.get("exePath").and_then(|item| item.as_str()).unwrap_or("");
            sample_key(title, exe)
        })
    }

    pub fn session_is_open(raw: &str) -> bool {
        let Ok(value) = serde_json::from_str::<Value>(raw) else { return false };
        let state = value.get("state").unwrap_or(&value);
        state.get("session").is_some_and(|item| item.is_object())
    }
}

pub fn session_seconds(started_at: u64, ended_at: u64) -> u64 {
    ended_at.saturating_sub(started_at) / 1000
}

pub fn format_exact(seconds: u64) -> String {
    let h = seconds / 3600;
    let m = (seconds % 3600) / 60;
    let s = seconds % 60;
    format!("{h}:{m:02}:{s:02}")
}

pub fn parse_tags(raw: &str) -> Vec<String> {
    let mut seen = std::collections::BTreeSet::new();
    let mut out = Vec::new();
    for part in raw.split([',', ';']) {
        let tag: String = part.trim().chars().take(32).collect();
        if tag.is_empty() {
            continue;
        }
        let key = tag_key(&tag);
        if !seen.insert(key) {
            continue;
        }
        out.push(tag);
        if out.len() == 12 {
            break;
        }
    }
    out
}

pub fn tag_key(name: &str) -> String {
    name.trim().to_lowercase()
}

pub fn now_ms() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as u64).unwrap_or(0)
}

fn clean_title(raw: &str) -> String {
    raw.trim().chars().take(200).collect()
}

fn new_id(now_ms: u64) -> String {
    static NEXT: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(1);
    let n = NEXT.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    format!("{now_ms:x}{n:x}")
}

fn yes() -> bool {
    true
}

fn iso_utc(ms: u64) -> String {
    let secs = ms / 1000;
    let millis = ms % 1000;
    let (year, month, day) = civil_from_unix_days((secs / 86400) as i64);
    let tod = secs % 86400;
    format!("{year:04}-{month:02}-{day:02}T{:02}:{:02}:{:02}.{millis:03}Z", tod / 3600, (tod % 3600) / 60, tod % 60)
}

fn civil_from_unix_days(days: i64) -> (i32, u32, u32) {
    let z = days + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = (z - era * 146097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = if m <= 2 { y + 1 } else { y };
    (year as i32, m as u32, d as u32)
}

fn strip_samples(lib: &mut Library) {
    let before = lib.games.len();
    lib.games.retain(|game| !is_sample(game));
    if lib.games.len() == before {
        return;
    }
    if lib.games.is_empty() {
        lib.tagbook.clear();
        lib.folders.clear();
        lib.session = None;
        return;
    }
    let used: std::collections::BTreeSet<String> = lib.games.iter().flat_map(|game| game.tags.iter().map(|tag| tag_key(tag))).collect();
    lib.tagbook.retain(|tag| used.contains(&tag_key(&tag.name)));
    let folders: std::collections::BTreeSet<String> = lib.games.iter().filter_map(|game| game.folder_id.clone()).collect();
    lib.folders.retain(|folder| folders.contains(&folder.id));
}

fn is_sample(game: &Game) -> bool {
    sample_key(&game.title, &game.exe_path)
}

fn sample_key(title: &str, exe: &str) -> bool {
    let title = title.trim().to_lowercase();
    let exe = exe.trim().to_lowercase().replace('/', "\\");
    let key = format!("{title}\0{exe}");
    matches!(
        key.as_str(),
        "harbor light\0c:\\games\\harborlight\\harborlight.exe"
            | "amber route\0d:\\portable\\amberroute\\amber.exe"
            | "northwind\0c:\\games\\northwind\\northwind.exe"
            | "glass saint\0"
            | "low tide\0c:\\games\\lowtide\\tide.exe"
            | "marble year\0"
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip_matches_the_window_file() {
        let raw = r##"{"state":{"games":[{"id":"a","title":"DMC","exePath":"E:\\DMC\\game.exe","workingDir":"","args":"","cover":null,"tags":["action"],"folderId":null,"note":"night","playSeconds":90,"lastPlayedAt":null,"createdAt":"2026-01-01T00:00:00.000Z","updatedAt":"2026-01-01T00:00:00.000Z"}],"folders":[],"tagbook":[{"name":"action","color":"#39c5bb"}],"settings":{"showHours":true,"showCovers":true,"confirmDelete":true,"trackTime":true,"motion":true,"medalsOn":true},"didSeed":true,"session":{"gameId":"a","startedAt":1000,"lastBeat":4000,"counting":true}},"version":0}"##;
        let lib = Library::load(Some(raw), 10_000);
        assert!(lib.session.is_none());
        assert_eq!(lib.games[0].play_seconds, 93);
        assert_eq!(lib.games[0].title, "DMC");
        let again = Library::load(Some(&lib.to_store_value()), 10_000);
        assert_eq!(again.games[0].title, "DMC");
        assert_eq!(again.games[0].note, "night");
        assert!(again.games[0].play_seconds >= 93);
    }

    #[test]
    fn samples_do_not_come_back() {
        let raw = r#"{"state":{"games":[{"id":"s","title":"Harbor Light","exePath":"C:\\Games\\HarborLight\\HarborLight.exe","workingDir":"","args":"","cover":null,"tags":[],"folderId":null,"note":"","playSeconds":0,"lastPlayedAt":null,"createdAt":"2026-01-01T00:00:00.000Z","updatedAt":"2026-01-01T00:00:00.000Z"}],"folders":[],"tagbook":[],"settings":{"showHours":true,"showCovers":true,"confirmDelete":true,"trackTime":true,"motion":true,"medalsOn":true},"didSeed":true,"session":null},"version":0}"#;
        let lib = Library::load(Some(raw), 0);
        assert!(lib.games.is_empty());
    }

    #[test]
    fn add_needs_a_title_and_keeps_order() {
        let mut lib = Library::empty();
        assert!(lib.add(Draft { title: "  ".into(), exe_path: String::new(), tags: String::new(), note: String::new() }, 1).is_err());
        lib.add(Draft { title: "One".into(), exe_path: r"C:\Games\a.exe".into(), tags: "Rpg, rpg".into(), note: String::new() }, 1_700_000_000_000).unwrap();
        lib.add(Draft { title: "Two".into(), exe_path: String::new(), tags: String::new(), note: String::new() }, 1_700_000_000_000).unwrap();
        assert_eq!(lib.games[0].title, "Two");
        assert_eq!(lib.games[1].tags, vec!["Rpg".to_string()]);
        assert_eq!(format_exact(3661), "1:01:01");
        assert_eq!(iso_utc(0), "1970-01-01T00:00:00.000Z");
    }
}
