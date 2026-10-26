use std::collections::BTreeMap;
use std::fs;
use std::io::Write;
use std::path::Path;

/// Catalog file for this copy. Values are strings, same as the previous window.
/// A file that cannot be read is never replaced. The first real write keeps
/// the previous bytes in `shelf-data.json.bak`.
#[derive(Debug)]
pub struct Store {
    path: Option<String>,
    data: BTreeMap<String, String>,
    locked: bool,
}

impl Store {
    pub fn open(path: Option<String>) -> Self {
        match path.as_ref().map(|file| read_map(file)) {
            Some(Read::Ready(data)) => Self { path, data, locked: false },
            Some(Read::Missing) | None => Self { path, data: BTreeMap::new(), locked: false },
            Some(Read::Broken) => Self { path, data: BTreeMap::new(), locked: true },
        }
    }

    pub fn locked(&self) -> bool {
        self.locked
    }

    pub fn get(&self, key: &str) -> Option<String> {
        self.data.get(key).cloned()
    }

    pub fn set(&mut self, key: String, value: String) -> bool {
        self.data.insert(key, value);
        self.write()
    }

    pub fn remove(&mut self, key: &str) -> bool {
        self.data.remove(key);
        self.write()
    }

    fn write(&self) -> bool {
        if self.locked {
            return false;
        }
        let Some(file) = &self.path else { return false };
        let file_os = file.replace('\\', std::path::MAIN_SEPARATOR_STR);
        let path = Path::new(&file_os);
        if let Some(parent) = path.parent() {
            if !parent.as_os_str().is_empty() {
                let _ = fs::create_dir_all(parent);
            }
        }
        if path.is_file() {
            let bak = format!("{file_os}.bak");
            if !Path::new(&bak).exists() {
                let _ = fs::copy(path, &bak);
            }
        }
        let body = serde_json::to_string(&self.data).unwrap_or_else(|_| "{}".into());
        let tmp = format!("{file_os}.{}.tmp", std::process::id());
        let mut out = match fs::File::create(&tmp) {
            Ok(file) => file,
            Err(_) => return false,
        };
        if out.write_all(body.as_bytes()).is_err() {
            let _ = fs::remove_file(&tmp);
            return false;
        }
        fs::rename(&tmp, &file_os).is_ok()
    }
}

enum Read {
    Missing,
    Ready(BTreeMap<String, String>),
    Broken,
}

fn read_map(file: &str) -> Read {
    let os = file.replace('\\', std::path::MAIN_SEPARATOR_STR);
    if !Path::new(&os).is_file() {
        return Read::Missing;
    }
    let Ok(text) = fs::read_to_string(&os) else { return Read::Broken };
    let Ok(value) = serde_json::from_str::<serde_json::Value>(&text) else { return Read::Broken };
    let Some(object) = value.as_object() else { return Read::Broken };
    if object.contains_key("state") && !object.keys().any(|key| key == "polka.library.v2") {
        let mut map = BTreeMap::new();
        map.insert("polka.library.v2".to_string(), text);
        return Read::Ready(map);
    }
    let mut map = BTreeMap::new();
    for (key, item) in object {
        if let Some(text) = item.as_str() {
            map.insert(key.clone(), text.to_string());
        } else if let Ok(text) = serde_json::to_string(item) {
            map.insert(key.clone(), text);
        }
    }
    Read::Ready(map)
}

#[cfg(test)]
mod tests {
    use super::Store;
    use std::fs;

    #[test]
    fn round_trip_stays_in_the_given_file() {
        let dir = std::env::temp_dir().join(format!("shelf-core-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        let file = dir.join("shelf-data.json");
        let path = file.to_string_lossy().to_string();
        let mut store = Store::open(Some(path.clone()));
        assert!(store.get("polka.library.v2").is_none());
        assert!(store.set("polka.library.v2".into(), "{\"games\":[]}".into()));
        let again = Store::open(Some(path));
        assert_eq!(again.get("polka.library.v2").as_deref(), Some("{\"games\":[]}"));
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn a_broken_file_is_not_replaced_and_the_first_write_keeps_a_copy() {
        let dir = std::env::temp_dir().join(format!("shelf-core-keep-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        let file = dir.join("shelf-data.json");
        fs::write(&file, "not json").unwrap();
        let mut broken = Store::open(Some(file.to_string_lossy().to_string()));
        assert!(broken.locked());
        assert!(!broken.set("polka.library.v2".into(), "{}".into()));
        assert_eq!(fs::read_to_string(&file).unwrap(), "not json");

        let old = r#"{"state":{"games":[]},"version":0}"#;
        fs::write(&file, old).unwrap();
        let mut legacy = Store::open(Some(file.to_string_lossy().to_string()));
        assert!(!legacy.locked());
        assert!(legacy.get("polka.library.v2").unwrap().contains("games"));
        assert!(legacy.set("polka.library.v2".into(), "{\"state\":{\"games\":[]}}".into()));
        assert_eq!(fs::read_to_string(dir.join("shelf-data.json.bak")).unwrap(), old);
        let _ = fs::remove_dir_all(&dir);
    }
}
