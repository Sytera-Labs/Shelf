/// Folder of this copy, then `shelf-data.json`. Never AppData.
pub fn catalog_file(exe_path: &str) -> Option<String> {
    let folder = win_dir(exe_path)?;
    Some(format!("{folder}\\shelf-data.json"))
}

/// Windows directory of a path, using `\` even on other systems.
pub fn win_dir(input: &str) -> Option<String> {
    if input.is_empty() || input.contains('\0') {
        return None;
    }
    let trimmed = input.trim();
    if trimmed.is_empty() || trimmed.contains('\0') {
        return None;
    }
    let file = win_normalize(trimmed)?;
    let slash = file.rfind('\\')?;
    let parent = &file[..slash];
    if parent.is_empty() || parent == "." {
        return None;
    }
    if parent.ends_with(':') {
        return Some(format!("{parent}\\"));
    }
    Some(parent.to_string())
}

pub fn win_normalize(input: &str) -> Option<String> {
    if input.is_empty() || input.contains('\0') {
        return None;
    }
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return None;
    }
    let slash = trimmed.replace('/', "\\");
    let unc = slash.starts_with("\\\\");
    let body = if unc { &slash[2..] } else { slash.as_str() };
    let mut parts: Vec<&str> = Vec::new();
    for part in body.split('\\') {
        if part.is_empty() || part == "." {
            continue;
        }
        if part == ".." {
            parts.pop();
            continue;
        }
        parts.push(part);
    }
    if parts.is_empty() {
        return None;
    }
    let joined = parts.join("\\");
    Some(if unc { format!("\\\\{joined}") } else { joined })
}

#[cfg(test)]
mod tests {
    use super::catalog_file;

    #[test]
    fn catalog_stays_beside_each_copy() {
        let older = catalog_file(r"E:\Shelf-1.3\Shelf.exe").unwrap();
        let clean = catalog_file(r"D:\Shelf-clean\Shelf.exe").unwrap();
        assert_eq!(older, r"E:\Shelf-1.3\shelf-data.json");
        assert_eq!(clean, r"D:\Shelf-clean\shelf-data.json");
        assert_ne!(older, clean);
        assert_eq!(catalog_file("C:/Games/Shelf.exe").as_deref(), Some(r"C:\Games\shelf-data.json"));
        assert!(!older.to_lowercase().contains("appdata"));
        assert!(catalog_file("").is_none());
        assert!(catalog_file("Shelf.exe").is_none());
        assert!(catalog_file("ok.exe\0bad").is_none());
    }
}
