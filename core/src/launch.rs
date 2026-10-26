use crate::catalog::win_dir;
use crate::catalog::win_normalize;
use serde::Serialize;

pub const POWERSHELL: &str = "$ErrorActionPreference = 'Stop'; Set-Location -LiteralPath $env:SHELF_CWD; $p = Start-Process -LiteralPath $env:SHELF_FILE -PassThru; Write-Output $p.Id";

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct LaunchPlan {
    pub file: String,
    pub cwd: String,
    pub command: String,
    pub args: Vec<String>,
    pub fallback: Fallback,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Fallback {
    pub file: String,
    pub cwd: String,
    pub shell: bool,
}

/// How Shelf opens a Windows program. CreateProcess with the program's own
/// folder is first. The PowerShell command is only the fallback, and the path
/// stays in environment data, not in the command text.
pub fn launch_plan(file_path: &str) -> Option<LaunchPlan> {
    if file_path.is_empty() || file_path.contains('\0') {
        return None;
    }
    let trimmed = file_path.trim();
    if trimmed.is_empty() || trimmed.contains('\0') {
        return None;
    }
    let file = win_normalize(trimmed)?;
    let cwd = win_dir(trimmed)?;
    Some(LaunchPlan {
        file: file.clone(),
        cwd: cwd.clone(),
        command: "powershell.exe".to_string(),
        args: vec![
            "-NoProfile".into(),
            "-NonInteractive".into(),
            "-WindowStyle".into(),
            "Hidden".into(),
            "-Command".into(),
            POWERSHELL.into(),
        ],
        fallback: Fallback { file, cwd, shell: false },
    })
}

#[cfg(test)]
mod tests {
    use super::{launch_plan, POWERSHELL};

    #[test]
    fn plan_keeps_the_path_out_of_the_command() {
        let plan = launch_plan(r"E:\Devil May Cry HD Collection\dmcLauncher.exe").unwrap();
        assert_eq!(plan.file, r"E:\Devil May Cry HD Collection\dmcLauncher.exe");
        assert_eq!(plan.cwd, r"E:\Devil May Cry HD Collection");
        assert!(!plan.fallback.shell);
        assert_eq!(plan.fallback.cwd, plan.cwd);
        assert!(!plan.args.join(" ").contains("Devil"));
        assert!(POWERSHELL.contains("Set-Location -LiteralPath"));
        assert!(POWERSHELL.contains("Start-Process -LiteralPath"));
        assert!(POWERSHELL.contains("-PassThru"));
        assert!(POWERSHELL.contains("Write-Output $p.Id"));
        assert!(POWERSHELL.find("Set-Location").unwrap() < POWERSHELL.find("Start-Process").unwrap());
        assert!(launch_plan("").is_none());
        assert!(launch_plan("ok.exe\0bad").is_none());
        assert!(launch_plan("game.exe").is_none());
        assert_eq!(launch_plan(r"C:\Games\Game.exe").unwrap().cwd, r"C:\Games");
        assert_eq!(launch_plan("C:/Games/Launcher.exe").unwrap().cwd, r"C:\Games");
    }
}
