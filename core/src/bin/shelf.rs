//! Shelf's own window. One program, no browser.
#![cfg_attr(windows, windows_subsystem = "windows")]

#[cfg(not(windows))]
fn main() {
    eprintln!("Shelf's window is a Windows program.");
    std::process::exit(2);
}

#[cfg(windows)]
fn main() {
    host::open();
}

#[cfg(windows)]
mod host;

#[cfg(windows)]
#[allow(dead_code)]
mod window {
    use shelf_core::{
        catalog_file, format_exact, launch_plan, list_processes, note_sample, now_ms, spawn_game, Draft, Library, Store, WatchState, STORE_KEY,
    };
    use std::collections::BTreeSet;
    use std::ffi::c_void;
    use std::sync::{Mutex, OnceLock};

    type HWND = *mut c_void;
    type HDC = *mut c_void;
    type HINSTANCE = *mut c_void;
    type HMENU = *mut c_void;
    type HBRUSH = *mut c_void;
    type HFONT = *mut c_void;
    type HGDIOBJ = *mut c_void;
    type HCURSOR = *mut c_void;
    type HICON = *mut c_void;
    type WndProc = unsafe extern "system" fn(HWND, u32, usize, isize) -> isize;

    const WM_DESTROY: u32 = 0x0002;
    const WM_SIZE: u32 = 0x0005;
    const WM_CLOSE: u32 = 0x0010;
    const WM_SETFONT: u32 = 0x0030;
    const WM_COMMAND: u32 = 0x0111;
    const WM_KEYDOWN: u32 = 0x0100;
    const WM_TIMER: u32 = 0x0113;
    const WM_MOUSEWHEEL: u32 = 0x020A;
    const WM_LBUTTONDOWN: u32 = 0x0201;
    const WM_LBUTTONDBLCLK: u32 = 0x0203;
    const WM_ERASEBKGND: u32 = 0x0014;
    const WM_PAINT: u32 = 0x000F;
    const EN_CHANGE: u32 = 0x0300;
    const EM_SETCUEBANNER: u32 = 0x1501;
    const WS_OVERLAPPEDWINDOW: u32 = 0x00CF0000;
    const WS_CLIPCHILDREN: u32 = 0x02000000;
    const WS_VISIBLE: u32 = 0x10000000;
    const WS_CHILD: u32 = 0x40000000;
    const WS_BORDER: u32 = 0x00800000;
    const WS_TABSTOP: u32 = 0x00010000;
    const WS_POPUP: u32 = 0x80000000;
    const WS_CAPTION: u32 = 0x00C00000;
    const WS_SYSMENU: u32 = 0x00080000;
    const ES_AUTOHSCROLL: u32 = 0x0080;
    const ES_MULTILINE: u32 = 0x0004;
    const ES_AUTOVSCROLL: u32 = 0x0040;
    const ES_WANTRETURN: u32 = 0x1000;
    const SW_SHOW: i32 = 5;
    const CW_USEDEFAULT: i32 = 0x80000000_u32 as i32;
    const SRCCOPY: u32 = 0x00CC0020;
    const DT_LEFT: u32 = 0;
    const DT_CENTER: u32 = 1;
    const DT_VCENTER: u32 = 4;
    const DT_SINGLELINE: u32 = 0x20;
    const DT_END_ELLIPSIS: u32 = 0x8000;
    const DT_NOPREFIX: u32 = 0x800;
    const DT_WORDBREAK: u32 = 0x10;
    const WM_DPICHANGED: u32 = 0x02E0;
    const VK_RETURN: usize = 0x0D;
    const VK_DELETE: usize = 0x2E;
    const VK_UP: usize = 0x26;
    const VK_DOWN: usize = 0x28;
    const IDYES: i32 = 6;
    const MB_YESNO: u32 = 0x4;
    const MB_ICONQUESTION: u32 = 0x20;
    const OFN_FILEMUSTEXIST: u32 = 0x1000;
    const OFN_PATHMUSTEXIST: u32 = 0x800;
    const OFN_EXPLORER: u32 = 0x80000;
    const HEAD: i32 = 96;

    #[repr(C)]
    struct WNDCLASSW {
        style: u32,
        lpfn: WndProc,
        cb_cls: i32,
        cb_wnd: i32,
        instance: HINSTANCE,
        icon: HICON,
        cursor: HCURSOR,
        background: HBRUSH,
        menu: *const u16,
        class_name: *const u16,
    }

    #[repr(C)]
    struct POINT {
        x: i32,
        y: i32,
    }

    #[repr(C)]
    struct MSG {
        hwnd: HWND,
        message: u32,
        wparam: usize,
        lparam: isize,
        time: u32,
        pt: POINT,
    }

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct RECT {
        left: i32,
        top: i32,
        right: i32,
        bottom: i32,
    }

    #[repr(C)]
    struct PAINTSTRUCT {
        hdc: HDC,
        erase: i32,
        rc: RECT,
        restore: i32,
        inc_update: i32,
        reserved: [u8; 32],
    }

    #[repr(C)]
    struct OPENFILENAMEW {
        struct_size: u32,
        owner: HWND,
        instance: HINSTANCE,
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
        hook: *mut c_void,
        template: *const u16,
        reserved: *mut c_void,
        reserved_dw: u32,
        flags_ex: u32,
    }

    #[derive(Clone, Copy, PartialEq, Eq)]
    enum Act {
        Add,
        Play,
        Edit,
        Delete,
        Lang,
    }

    struct Watch {
        state: WatchState,
    }

    struct App {
        hwnd: HWND,
        search: HWND,
        path: String,
        lib: Library,
        query: String,
        selected: Option<String>,
        scroll: i32,
        notice: String,
        english: bool,
        writable: bool,
        font: HFONT,
        title_font: HFONT,
        watch: Option<Watch>,
        cue: Vec<u16>,
    }

    struct Dialog {
        hwnd: HWND,
        title: HWND,
        path: HWND,
        tags: HWND,
        note: HWND,
        done: bool,
        ok: bool,
        result_title: String,
        result_path: String,
        result_tags: String,
        result_note: String,
    }

    unsafe impl Send for App {}
    unsafe impl Send for Dialog {}

    static APP: OnceLock<Mutex<App>> = OnceLock::new();
    static DIALOG: OnceLock<Mutex<Dialog>> = OnceLock::new();

    fn app() -> std::sync::MutexGuard<'static, App> {
        APP.get().expect("window").lock().expect("window lock")
    }

    pub fn open() {
        unsafe {
            if SetProcessDpiAwarenessContext((-4isize) as *mut c_void) == 0 {
                SetProcessDPIAware();
            }
            let instance = GetModuleHandleW(std::ptr::null());
            let path = catalog_path();
            let mut store = Store::open(Some(path.clone()));
            let english = store.get("shelf.locale").is_some_and(|value| value.starts_with("en"));
            let raw = store.get(STORE_KEY);
            let lib = Library::load(raw.as_deref(), now_ms());
            let locked = store.locked();
            let writable = !locked && raw.as_deref().map(|text| Library::safe_to_rewrite(text, &lib)).unwrap_or(true);
            if writable {
                if let Some(text) = raw.as_deref() {
                    if Library::session_is_open(text) {
                        let _ = store.set(STORE_KEY.to_string(), lib.to_store_value());
                    }
                }
            }
            let notice = if writable {
                String::new()
            } else if english {
                "The shelf file was not read, so it was left unchanged".to_string()
            } else {
                "Файл полки не прочитан и не изменён".to_string()
            };
            let face = wide("Segoe UI");
            let font = CreateFontW(-16, 0, 0, 0, 400, 0, 0, 0, 1, 0, 0, 5, 0, face.as_ptr());
            let title_font = CreateFontW(-28, 0, 0, 0, 600, 0, 0, 0, 1, 0, 0, 5, 0, face.as_ptr());
            let _ = APP.set(Mutex::new(App {
                hwnd: std::ptr::null_mut(),
                search: std::ptr::null_mut(),
                path,
                lib,
                query: String::new(),
                selected: None,
                scroll: 0,
                notice,
                english,
                writable,
                font,
                title_font,
                watch: None,
                cue: Vec::new(),
            }));
            let class = wide("ShelfWindow");
            let wc = WNDCLASSW {
                style: 0x0002 | 0x0001 | 0x0008,
                lpfn: main_proc,
                cb_cls: 0,
                cb_wnd: 0,
                instance,
                icon: std::ptr::null_mut(),
                cursor: LoadCursorW(std::ptr::null_mut(), 32512 as *const u16),
                background: std::ptr::null_mut(),
                menu: std::ptr::null(),
                class_name: class.as_ptr(),
            };
            RegisterClassW(&wc);
            let title = wide("Shelf");
            let hwnd = CreateWindowExW(
                0,
                class.as_ptr(),
                title.as_ptr(),
                WS_OVERLAPPEDWINDOW | WS_CLIPCHILDREN | WS_VISIBLE,
                CW_USEDEFAULT,
                CW_USEDEFAULT,
                980,
                700,
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                instance,
                std::ptr::null_mut(),
            );
            if hwnd.is_null() {
                return;
            }
            ShowWindow(hwnd, SW_SHOW);
            UpdateWindow(hwnd);
            let mut msg = std::mem::zeroed::<MSG>();
            while GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0) > 0 {
                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
        }
    }

    unsafe extern "system" fn main_proc(hwnd: HWND, msg: u32, wparam: usize, lparam: isize) -> isize {
        match msg {
            0x0001 => {
                let mut ui = app();
                ui.hwnd = hwnd;
                let instance = GetModuleHandleW(std::ptr::null());
                let edit_class = wide("EDIT");
                let search = CreateWindowExW(
                    0,
                    edit_class.as_ptr(),
                    wide("").as_ptr(),
                    WS_CHILD | WS_VISIBLE | WS_BORDER | WS_TABSTOP | ES_AUTOHSCROLL,
                    24,
                    52,
                    400,
                    28,
                    hwnd,
                    50isize as HMENU,
                    instance,
                    std::ptr::null_mut(),
                );
                SendMessageW(search, WM_SETFONT, ui.font as usize, 1);
                ui.search = search;
                drop(ui);
                set_cue();
                SetTimer(hwnd, 1, 1000, std::ptr::null_mut());
                0
            }
            WM_SIZE => {
                let ui = app();
                let search = ui.search;
                drop(ui);
                let mut rect = std::mem::zeroed::<RECT>();
                GetClientRect(hwnd, &mut rect);
                MoveWindow(search, 24, 52, (rect.right - 48).max(120), 28, 1);
                redraw(hwnd);
                0
            }
            WM_COMMAND => {
                if (wparam >> 16) as u16 as u32 == EN_CHANGE && (wparam & 0xffff) == 50 {
                    let mut ui = app();
                    ui.query = control_text(ui.search);
                    ui.scroll = 0;
                    let hwnd = ui.hwnd;
                    drop(ui);
                    redraw(hwnd);
                }
                0
            }
            WM_TIMER => {
                on_tick();
                0
            }
            WM_MOUSEWHEEL => {
                let delta = ((wparam >> 16) as i16) / 120;
                let mut ui = app();
                let mut rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
                unsafe { GetClientRect(ui.hwnd, &mut rect) };
                let (cols, card) = grid(rect.right);
                let step = card * 4 / 3 + 66;
                let visible = ((rect.bottom - HEAD - 28) / step).max(1);
                let total = ui.lib.visible(&ui.query).len() as i32;
                let rows = (total + cols - 1) / cols;
                ui.scroll = (ui.scroll - delta as i32).clamp(0, (rows - visible).max(0));
                let hwnd = ui.hwnd;
                drop(ui);
                redraw(hwnd);
                0
            }
            WM_LBUTTONDOWN => {
                let x = low(lparam);
                let y = high(lparam);
                if let Some(act) = hit_button(x, y) {
                    run_act(act);
                } else if let Some(id) = hit_row(x, y) {
                    app().selected = Some(id);
                    redraw(hwnd);
                }
                0
            }
            WM_LBUTTONDBLCLK => {
                if let Some(id) = hit_row(low(lparam), high(lparam)) {
                    app().selected = Some(id);
                    run_act(Act::Play);
                }
                0
            }
            WM_KEYDOWN => {
                match wparam {
                    VK_RETURN => run_act(Act::Play),
                    VK_DELETE => run_act(Act::Delete),
                    VK_UP => move_sel(-1),
                    VK_DOWN => move_sel(1),
                    _ => {}
                }
                0
            }
            WM_DPICHANGED => {
                let suggested = *(lparam as *const RECT);
                SetWindowPos(
                    hwnd,
                    std::ptr::null_mut(),
                    suggested.left,
                    suggested.top,
                    suggested.right - suggested.left,
                    suggested.bottom - suggested.top,
                    0x0004 | 0x0010,
                );
                0
            }
            WM_ERASEBKGND => 1,
            WM_PAINT => {
                paint(hwnd);
                0
            }
            WM_CLOSE => {
                let mut ui = app();
                ui.lib.stop_session(now_ms());
                save_ui(&mut ui);
                drop(ui);
                DestroyWindow(hwnd);
                0
            }
            WM_DESTROY => {
                PostQuitMessage(0);
                0
            }
            _ => DefWindowProcW(hwnd, msg, wparam, lparam),
        }
    }

    fn on_tick() {
        let ui = app();
        let Some(watch) = ui.watch.as_ref() else { return };
        let state = watch.state.clone();
        drop(ui);
        let rows = list_processes();
        let now = now_ms();
        let mut ui = app();
        let Some(watch) = ui.watch.as_mut() else { return };
        if watch.state.file != state.file {
            return;
        }
        let next = note_sample(state, &rows, now as u128);
        if next.stop {
            ui.watch = None;
            ui.lib.stop_session(now);
            ui.notice.clear();
            save_ui(&mut ui);
        } else {
            watch.state = next;
            if let Some(session) = ui.lib.session.as_mut() {
                session.last_beat = now;
            }
        }
        let hwnd = ui.hwnd;
        drop(ui);
        redraw(hwnd);
    }

    fn run_act(act: Act) {
        match act {
            Act::Add => edit_game(None),
            Act::Edit => {
                let id = app().selected.clone();
                if let Some(id) = id {
                    edit_game(Some(id));
                }
            }
            Act::Delete => delete_selected(),
            Act::Play => play_selected(),
            Act::Lang => {
                let mut ui = app();
                ui.english = !ui.english;
                let path = ui.path.clone();
                let english = ui.english;
                drop(ui);
                let mut store = Store::open(Some(path));
                let _ = store.set("shelf.locale".into(), if english { "en-US" } else { "ru" }.into());
                set_cue();
                redraw(app().hwnd);
            }
        }
    }

    fn edit_game(id: Option<String>) {
        let (english, existing) = {
            let ui = app();
            let existing = id.as_ref().and_then(|id| ui.lib.games.iter().find(|game| &game.id == id)).map(|game| {
            (game.title.clone(), game.exe_path.clone(), game.tags.join(", "), game.note.clone())
        });
            (ui.english, existing)
        };
        if id.is_some() && existing.is_none() {
            return;
        }
        let Some(draft) = ask_draft(english, existing) else { return };
        let mut ui = app();
        let now = now_ms();
        let result = if let Some(id) = id {
            ui.lib.update(&id, draft, now).map(|()| id)
        } else {
            ui.lib.add(draft, now)
        };
        match result {
            Ok(id) => {
                ui.selected = Some(id);
                ui.notice.clear();
                save_ui(&mut ui);
            }
            Err(()) => ui.notice = say(ui.english, "Нужно название", "A name is required"),
        }
        let hwnd = ui.hwnd;
        drop(ui);
        redraw(hwnd);
    }

    fn delete_selected() {
        let (id, english, confirm, hwnd) = {
            let ui = app();
            (ui.selected.clone(), ui.english, ui.lib.settings.confirm_delete, ui.hwnd)
        };
        let Some(id) = id else { return };
        if confirm {
            let text = wide(&say(english, "Убрать эту карточку с полки?", "Remove this card from the shelf?"));
            let title = wide("Shelf");
            let answer = unsafe { MessageBoxW(hwnd, text.as_ptr(), title.as_ptr(), MB_YESNO | MB_ICONQUESTION) };
            if answer != IDYES {
                return;
            }
        }
        let mut ui = app();
        let was_playing = ui.lib.session.as_ref().is_some_and(|session| session.game_id == id);
        ui.lib.remove(&id);
        ui.selected = None;
        if was_playing {
            ui.watch = None;
        }
        save_ui(&mut ui);
        let hwnd = ui.hwnd;
        drop(ui);
        redraw(hwnd);
    }

    fn play_selected() {
        let (id, path, english, track) = {
            let ui = app();
            let id = ui.selected.clone();
            let path = id.as_ref().and_then(|id| ui.lib.games.iter().find(|game| game.id == *id)).map(|game| game.exe_path.clone());
            (id, path, ui.english, ui.lib.settings.track_time)
        };
        let Some(id) = id else { return };
        let Some(path) = path.filter(|path| !path.trim().is_empty()) else {
            let mut ui = app();
            ui.notice = say(english, "У карточки нет файла запуска", "This card has no program file");
            let hwnd = ui.hwnd;
            drop(ui);
            redraw(hwnd);
            return;
        };
        let Some(plan) = launch_plan(&path) else {
            fail_notice(english);
            return;
        };
        let Some((pid, file)) = spawn_game(&plan) else {
            fail_notice(english);
            return;
        };
        let now = now_ms();
        let mut ui = app();
        if track {
            ui.lib.start_session(&id, now);
        } else {
            ui.lib.stop_session(now);
            ui.notice = say(english, "Часы выключены в этой полке", "The clock is off for this shelf");
        }
        ui.watch = Some(Watch {
            state: WatchState {
                tracked: BTreeSet::from([pid]),
                misses: 0,
                started_at: now as u128,
                file,
                stop: false,
            },
        });
        save_ui(&mut ui);
        let hwnd = ui.hwnd;
        drop(ui);
        redraw(hwnd);
    }

    fn fail_notice(english: bool) {
        let mut ui = app();
        ui.notice = say(english, "Не удалось открыть файл", "The file did not open");
        let hwnd = ui.hwnd;
        drop(ui);
        redraw(hwnd);
    }

    fn move_sel(step: i32) {
        let mut ui = app();
        let rows = ui.lib.visible(&ui.query);
        if rows.is_empty() {
            return;
        }
        let current = ui.selected.as_ref().and_then(|id| rows.iter().position(|index| ui.lib.games[*index].id == *id));
        let next = match current {
            Some(index) => (index as i32 + step).clamp(0, rows.len() as i32 - 1) as usize,
            None => 0,
        };
        ui.selected = Some(ui.lib.games[rows[next]].id.clone());
        let hwnd = ui.hwnd;
        drop(ui);
        redraw(hwnd);
    }

    fn ask_draft(english: bool, game: Option<(String, String, String, String)>) -> Option<Draft> {
        unsafe {
            let instance = GetModuleHandleW(std::ptr::null());
            let class_name = wide("ShelfEditor");
            let class = WNDCLASSW {
                style: 0,
                lpfn: dialog_proc,
                cb_cls: 0,
                cb_wnd: 0,
                instance,
                icon: std::ptr::null_mut(),
                cursor: LoadCursorW(std::ptr::null_mut(), 32512 as *const u16),
                background: CreateSolidBrush(0x001A1612),
                menu: std::ptr::null(),
                class_name: class_name.as_ptr(),
            };
            RegisterClassW(&class);
            let parent = app().hwnd;
            let font = app().font;
            let caption = wide(&say(english, "Карточка", "Card"));
            let hwnd = CreateWindowExW(
                0,
                class_name.as_ptr(),
                caption.as_ptr(),
                WS_POPUP | WS_CAPTION | WS_SYSMENU | WS_VISIBLE,
                180,
                120,
                480,
                430,
                parent,
                std::ptr::null_mut(),
                instance,
                std::ptr::null_mut(),
            );
            if hwnd.is_null() {
                return None;
            }
            let edit = wide("EDIT");
            let button = wide("BUTTON");
            let title = child(hwnd, &edit, "", 24, 36, 420, 26, 101, font);
            let path = child(hwnd, &edit, "", 24, 96, 300, 26, 102, font);
            let tags = child(hwnd, &edit, "", 24, 156, 420, 26, 103, font);
            let note = child(hwnd, &edit, "", 24, 216, 420, 72, 104, font);
            let _browse = child(hwnd, &button, &say(english, "Обзор", "Browse"), 332, 94, 112, 28, 3, font);
            let _ok = child(hwnd, &button, &say(english, "Сохранить", "Save"), 24, 310, 140, 32, 1, font);
            let _cancel = child(hwnd, &button, &say(english, "Отмена", "Cancel"), 172, 310, 140, 32, 2, font);
            let _name = child(hwnd, &wide("STATIC"), &say(english, "Название", "Name"), 24, 14, 200, 18, 201, font);
            let _file = child(hwnd, &wide("STATIC"), &say(english, "Файл запуска", "Program file"), 24, 74, 280, 18, 202, font);
            let _tag = child(hwnd, &wide("STATIC"), &say(english, "Метки через запятую", "Tags, separated by commas"), 24, 134, 320, 18, 203, font);
            let _notes = child(hwnd, &wide("STATIC"), &say(english, "Заметка", "Note"), 24, 194, 200, 18, 204, font);
            if let Some((name, file, tag_text, note_text)) = game {
                SetWindowTextW(title, wide(&name).as_ptr());
                SetWindowTextW(path, wide(&file).as_ptr());
                SetWindowTextW(tags, wide(&tag_text).as_ptr());
                SetWindowTextW(note, wide(&note_text).as_ptr());
            }
            let slot = dialog_slot();
            {
                let mut dialog = slot.lock().expect("dialog");
                dialog.hwnd = hwnd;
                dialog.title = title;
                dialog.path = path;
                dialog.tags = tags;
                dialog.note = note;
                dialog.done = false;
                dialog.ok = false;
            }
            EnableWindow(parent, 0);
            let mut msg = std::mem::zeroed::<MSG>();
            let result = loop {
                let finished = slot.lock().expect("dialog").done;
                if finished {
                    let dialog = slot.lock().expect("dialog");
                    break dialog.ok.then(|| Draft {
                        title: dialog.result_title.clone(),
                        exe_path: dialog.result_path.clone(),
                        tags: dialog.result_tags.clone(),
                        note: dialog.result_note.clone(),
                    });
                }
                let got = GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0);
                if got <= 0 {
                    PostQuitMessage(0);
                    break None;
                }
                if IsDialogMessageW(hwnd, &msg) == 0 {
                    TranslateMessage(&msg);
                    DispatchMessageW(&msg);
                }
            };
            EnableWindow(parent, 1);
            SetForegroundWindow(parent);
            result
        }
    }

    fn child(parent: HWND, class: &[u16], text: &str, x: i32, y: i32, w: i32, h: i32, id: isize, font: HFONT) -> HWND {
        let style = if class_is(class, "BUTTON") {
            WS_CHILD | WS_VISIBLE | WS_TABSTOP
        } else if class_is(class, "STATIC") {
            WS_CHILD | WS_VISIBLE
        } else if id == 104 {
            WS_CHILD | WS_VISIBLE | WS_TABSTOP | WS_BORDER | ES_MULTILINE | ES_AUTOVSCROLL | ES_WANTRETURN
        } else {
            WS_CHILD | WS_VISIBLE | WS_TABSTOP | WS_BORDER | ES_AUTOHSCROLL
        };
        unsafe {
            let hwnd = CreateWindowExW(0, class.as_ptr(), wide(text).as_ptr(), style, x, y, w, h, parent, id as HMENU, GetModuleHandleW(std::ptr::null()), std::ptr::null_mut());
            SendMessageW(hwnd, WM_SETFONT, font as usize, 1);
            hwnd
        }
    }

    fn class_is(class: &[u16], name: &str) -> bool {
        let wanted = wide(name);
        class == wanted.as_slice()
    }

    unsafe extern "system" fn dialog_proc(hwnd: HWND, msg: u32, wparam: usize, lparam: isize) -> isize {
        match msg {
            WM_COMMAND => {
                match (wparam & 0xffff) as isize {
                    1 => {
                        let mut dialog = dialog_slot().lock().expect("dialog");
                        dialog.result_title = control_text(dialog.title);
                        dialog.result_path = control_text(dialog.path);
                        dialog.result_tags = control_text(dialog.tags);
                        dialog.result_note = control_text(dialog.note);
                        dialog.ok = true;
                        dialog.done = true;
                        let own = dialog.hwnd;
                        drop(dialog);
                        DestroyWindow(own);
                    }
                    2 => {
                        let mut dialog = dialog_slot().lock().expect("dialog");
                        dialog.ok = false;
                        dialog.done = true;
                        let own = dialog.hwnd;
                        drop(dialog);
                        DestroyWindow(own);
                    }
                    3 => {
                        let dialog = dialog_slot().lock().expect("dialog");
                        let owner = dialog.hwnd;
                        let path = dialog.path;
                        drop(dialog);
                        browse(owner, path);
                    }
                    _ => {}
                }
                0
            }
            WM_CLOSE => {
                let mut dialog = dialog_slot().lock().expect("dialog");
                dialog.ok = false;
                dialog.done = true;
                drop(dialog);
                DestroyWindow(hwnd);
                0
            }
            _ => DefWindowProcW(hwnd, msg, wparam, lparam),
        }
    }

    fn browse(owner: HWND, path_edit: HWND) {
        unsafe {
            let mut file = [0u16; 520];
            let current = wide(&control_text(path_edit));
            for (index, unit) in current.iter().take(519).enumerate() {
                file[index] = *unit;
            }
            let filter = wide("Programs\0*.exe\0All\0*.*\0");
            let def = wide("exe");
            let mut ofn = std::mem::zeroed::<OPENFILENAMEW>();
            ofn.struct_size = std::mem::size_of::<OPENFILENAMEW>() as u32;
            ofn.owner = owner;
            ofn.filter = filter.as_ptr();
            ofn.file = file.as_mut_ptr();
            ofn.max_file = file.len() as u32;
            ofn.flags = OFN_FILEMUSTEXIST | OFN_PATHMUSTEXIST | OFN_EXPLORER;
            ofn.def_ext = def.as_ptr();
            if GetOpenFileNameW(&mut ofn) != 0 {
                SetWindowTextW(path_edit, file.as_ptr());
            }
        }
    }

    fn dialog_slot() -> &'static Mutex<Dialog> {
        DIALOG.get_or_init(|| {
            Mutex::new(Dialog {
                hwnd: std::ptr::null_mut(),
                title: std::ptr::null_mut(),
                path: std::ptr::null_mut(),
                tags: std::ptr::null_mut(),
                note: std::ptr::null_mut(),
                done: false,
                ok: false,
                result_title: String::new(),
                result_path: String::new(),
                result_tags: String::new(),
                result_note: String::new(),
            })
        })
    }

    fn set_cue() {
        let mut ui = app();
        let text = say(ui.english, "Поиск", "Search");
        ui.cue = wide(&text);
        let search = ui.search;
        let ptr = ui.cue.as_ptr() as isize;
        drop(ui);
        unsafe { SendMessageW(search, EM_SETCUEBANNER, 0, ptr) };
    }

    fn save_ui(ui: &mut App) -> bool {
        if !ui.writable {
            ui.notice = say(ui.english, "Файл полки не изменён", "The shelf file was left as it was");
            return false;
        }
        let mut store = Store::open(Some(ui.path.clone()));
        if store.locked() || !store.set(STORE_KEY.to_string(), ui.lib.to_store_value()) {
            ui.writable = false;
            ui.notice = say(ui.english, "Файл полки не изменён", "The shelf file was left as it was");
            return false;
        }
        true
    }

    fn catalog_path() -> String {
        let exe = std::env::current_exe().ok().map(|path| path.to_string_lossy().to_string()).unwrap_or_default();
        catalog_file(&exe).unwrap_or_else(|| "shelf-data.json".into())
    }

    fn say(english: bool, ru: &str, en: &str) -> String {
        if english { en } else { ru }.to_string()
    }

    fn buttons(width: i32, english: bool) -> Vec<(Act, RECT, String)> {
        let labels = [
            (Act::Add, say(english, "Добавить", "Add")),
            (Act::Play, say(english, "Играть", "Play")),
            (Act::Edit, say(english, "Изменить", "Edit")),
            (Act::Delete, say(english, "Убрать", "Remove")),
            (Act::Lang, say(english, "RU", "EN")),
        ];
        let mut x = width - 24;
        let mut out = Vec::new();
        for (act, label) in labels.into_iter().rev() {
            let w = if act == Act::Lang { 52 } else { 112 };
            x -= w;
            out.push((act, RECT { left: x, top: 16, right: x + w - 8, bottom: 46 }, label));
            x -= 8;
        }
        out
    }

    fn hit_button(x: i32, y: i32) -> Option<Act> {
        let ui = app();
        let mut rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
        unsafe { GetClientRect(ui.hwnd, &mut rect) };
        buttons(rect.right, ui.english).into_iter().find(|(_, area, _)| inside(x, y, area)).map(|(act, _, _)| act)
    }

    fn hit_row(x: i32, y: i32) -> Option<String> {
        if y < HEAD {
            return None;
        }
        let ui = app();
        let mut rect = RECT { left: 0, top: 0, right: 0, bottom: 0 };
        unsafe { GetClientRect(ui.hwnd, &mut rect) };
        spines(&ui, rect.right).into_iter().find(|case| inside(x, y, &case.cover) || inside(x, y, &case.caption)).map(|case| case.id)
    }

    fn inside(x: i32, y: i32, rect: &RECT) -> bool {
        x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom
    }

    struct Spine {
        id: String,
        cover: RECT,
        caption: RECT,
    }

    fn grid(width: i32) -> (i32, i32) {
        let inner = (width - 48).max(180);
        let cols = (inner / 176).clamp(2, 8);
        let card = (inner - (cols - 1) * 18) / cols;
        (cols, card)
    }

    fn spines(ui: &App, width: i32) -> Vec<Spine> {
        let (cols, card) = grid(width);
        let cover_h = card * 4 / 3;
        let block = cover_h + 46;
        let step = block + 20;
        ui.lib.visible(&ui.query).into_iter().enumerate().map(|(n, slot)| {
            let col = (n as i32) % cols;
            let row = (n as i32) / cols - ui.scroll;
            let x = 24 + col * (card + 18);
            let y = HEAD + row * step;
            Spine {
                id: ui.lib.games[slot].id.clone(),
                cover: RECT { left: x, top: y, right: x + card, bottom: y + cover_h },
                caption: RECT { left: x, top: y + cover_h + 6, right: x + card, bottom: y + block },
            }
        }).collect()
    }

    fn low(value: isize) -> i32 {
        value as i16 as i32
    }

    fn high(value: isize) -> i32 {
        (value >> 16) as i16 as i32
    }

    fn redraw(hwnd: HWND) {
        unsafe { InvalidateRect(hwnd, std::ptr::null(), 0) };
    }

    fn wide(text: &str) -> Vec<u16> {
        text.encode_utf16().chain(std::iter::once(0)).collect()
    }

    fn control_text(hwnd: HWND) -> String {
        unsafe {
            let len = GetWindowTextLengthW(hwnd).max(0) as usize;
            let mut buf = vec![0u16; len + 1];
            GetWindowTextW(hwnd, buf.as_mut_ptr(), buf.len() as i32);
            String::from_utf16_lossy(&buf[..len])
        }
    }

    fn paint(hwnd: HWND) {
        unsafe {
            let mut ps = std::mem::zeroed::<PAINTSTRUCT>();
            let hdc = BeginPaint(hwnd, &mut ps);
            let mut rect = std::mem::zeroed::<RECT>();
            GetClientRect(hwnd, &mut rect);
            let w = rect.right.max(1);
            let h = rect.bottom.max(1);
            let mem = CreateCompatibleDC(hdc);
            let bmp = CreateCompatibleBitmap(hdc, w, h);
            let old = SelectObject(mem, bmp as HGDIOBJ);
            draw(mem, w, h);
            BitBlt(hdc, 0, 0, w, h, mem, 0, 0, SRCCOPY);
            SelectObject(mem, old);
            DeleteObject(bmp as HGDIOBJ);
            DeleteDC(mem);
            EndPaint(hwnd, &ps);
        }
    }

    fn draw(dc: HDC, w: i32, h: i32) {
        let ui = app();
        let bg = 0x00070605;
        let raised = 0x001E1B17;
        let ink = 0x00F7F7F4;
        let muted = 0x00A6A39A;
        let accent = 0x00BBC539;
        let accent_ink = 0x001E2004;
        unsafe {
            fill(dc, RECT { left: 0, top: 0, right: w, bottom: h }, bg);
            let old = SelectObject(dc, ui.title_font as HGDIOBJ);
            write(dc, "Shelf", RECT { left: 24, top: 8, right: 240, bottom: 48 }, DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX, ink);
            SelectObject(dc, ui.font as HGDIOBJ);
            let count = say(ui.english, &format!("{} на полке", ui.lib.games.len()), &format!("{} on the shelf", ui.lib.games.len()));
            write(dc, &count, RECT { left: 150, top: 14, right: 420, bottom: 46 }, DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX, muted);
            for (_, area, label) in buttons(w, ui.english) {
                fill(dc, area, raised);
                write(dc, &label, area, DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX, ink);
            }
            let cases = spines(&ui, w);
            if ui.lib.visible(&ui.query).is_empty() {
                let empty = say(ui.english, "На полке пусто", "The shelf is empty");
                write(dc, &empty, RECT { left: 24, top: HEAD + 48, right: w - 24, bottom: HEAD + 90 }, DT_LEFT | DT_NOPREFIX, muted);
            }
            let now = now_ms();
            for case in cases {
                if case.cover.bottom < HEAD || case.cover.top > h - 24 {
                    continue;
                }
                let game = ui.lib.games.iter().find(|game| game.id == case.id);
                let Some(game) = game else { continue };
                let selected = ui.selected.as_deref() == Some(game.id.as_str());
                let tint = tag_color(&ui.lib, game.tags.first().map(String::as_str).unwrap_or(""));
                if selected {
                    fill(dc, RECT { left: case.cover.left - 2, top: case.cover.top - 2, right: case.cover.right + 2, bottom: case.cover.bottom + 2 }, accent);
                }
                fill(dc, case.cover, tint);
                let mark = game.title.chars().next().unwrap_or('·').to_string();
                write(dc, &mark, case.cover, DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX, accent_ink);
                write(dc, &game.title, RECT { left: case.caption.left, top: case.caption.top, right: case.caption.right, bottom: case.caption.top + 20 }, DT_LEFT | DT_SINGLELINE | DT_END_ELLIPSIS | DT_NOPREFIX, ink);
                if ui.lib.settings.show_hours {
                    let time = format_exact(ui.lib.shown_seconds(game, now));
                    write(dc, &time, RECT { left: case.caption.left, top: case.caption.top + 20, right: case.caption.right, bottom: case.caption.bottom }, DT_LEFT | DT_SINGLELINE | DT_NOPREFIX, muted);
                }
            }
            let foot = say(ui.english, "Shelf 1.8  ·  карточки  ·  без сети", "Shelf 1.8  ·  cards  ·  offline");
            let line = if ui.notice.is_empty() { foot } else { ui.notice.clone() };
            write(dc, &line, RECT { left: 24, top: h - 26, right: w - 24, bottom: h - 4 }, DT_LEFT | DT_SINGLELINE | DT_END_ELLIPSIS | DT_NOPREFIX, muted);
            SelectObject(dc, old);
        }
    }

    fn tag_color(lib: &Library, tag: &str) -> u32 {
        let key = tag.trim().to_lowercase();
        let hex = lib.tagbook.iter().find(|item| item.name.trim().to_lowercase() == key).map(|item| item.color.as_str()).unwrap_or("#39c5bb");
        let hex = hex.trim().trim_start_matches('#');
        if hex.len() != 6 {
            return 0x00BBC539;
        }
        let Ok(value) = u32::from_str_radix(hex, 16) else { return 0x00BBC539 };
        ((value & 0xff) << 16) | (value & 0xff00) | ((value >> 16) & 0xff)
    }

    unsafe fn fill(dc: HDC, rect: RECT, color: u32) {
        let brush = CreateSolidBrush(color);
        FillRect(dc, &rect, brush);
        DeleteObject(brush as HGDIOBJ);
    }

    unsafe fn write(dc: HDC, text: &str, mut rect: RECT, flags: u32, color: u32) {
        let wide = wide(text);
        SetTextColor(dc, color);
        SetBkMode(dc, 1);
        DrawTextW(dc, wide.as_ptr(), -1, &mut rect, flags);
    }

    #[link(name = "user32")]
    extern "system" {
        fn RegisterClassW(class: *const WNDCLASSW) -> u16;
        fn CreateWindowExW(ex: u32, class: *const u16, window: *const u16, style: u32, x: i32, y: i32, w: i32, h: i32, parent: HWND, menu: HMENU, instance: HINSTANCE, param: *mut c_void) -> HWND;
        fn DestroyWindow(hwnd: HWND) -> i32;
        fn ShowWindow(hwnd: HWND, cmd: i32) -> i32;
        fn UpdateWindow(hwnd: HWND) -> i32;
        fn GetMessageW(msg: *mut MSG, hwnd: HWND, min: u32, max: u32) -> i32;
        fn TranslateMessage(msg: *const MSG) -> i32;
        fn DispatchMessageW(msg: *const MSG) -> isize;
        fn DefWindowProcW(hwnd: HWND, msg: u32, wparam: usize, lparam: isize) -> isize;
        fn PostQuitMessage(code: i32);
        fn BeginPaint(hwnd: HWND, paint: *mut PAINTSTRUCT) -> HDC;
        fn EndPaint(hwnd: HWND, paint: *const PAINTSTRUCT) -> i32;
        fn GetClientRect(hwnd: HWND, rect: *mut RECT) -> i32;
        fn InvalidateRect(hwnd: HWND, rect: *const RECT, erase: i32) -> i32;
        fn FillRect(dc: HDC, rect: *const RECT, brush: HBRUSH) -> i32;
        fn DrawTextW(dc: HDC, text: *const u16, len: i32, rect: *mut RECT, format: u32) -> i32;
        fn SetTextColor(dc: HDC, color: u32) -> u32;
        fn SetBkMode(dc: HDC, mode: i32) -> i32;
        fn LoadCursorW(instance: HINSTANCE, name: *const u16) -> HCURSOR;
        fn SetTimer(hwnd: HWND, id: usize, elapse: u32, proc: *mut c_void) -> usize;
        fn SendMessageW(hwnd: HWND, msg: u32, wparam: usize, lparam: isize) -> isize;
        fn MoveWindow(hwnd: HWND, x: i32, y: i32, w: i32, h: i32, repaint: i32) -> i32;
        fn GetWindowTextW(hwnd: HWND, buf: *mut u16, max: i32) -> i32;
        fn GetWindowTextLengthW(hwnd: HWND) -> i32;
        fn SetWindowTextW(hwnd: HWND, text: *const u16) -> i32;
        fn MessageBoxW(hwnd: HWND, text: *const u16, title: *const u16, kind: u32) -> i32;
        fn GetModuleHandleW(name: *const u16) -> HINSTANCE;
        fn SetProcessDPIAware() -> i32;
        fn SetProcessDpiAwarenessContext(value: *mut c_void) -> i32;
        fn SetWindowPos(hwnd: HWND, after: HWND, x: i32, y: i32, w: i32, h: i32, flags: u32) -> i32;
        fn EnableWindow(hwnd: HWND, enable: i32) -> i32;
        fn SetForegroundWindow(hwnd: HWND) -> i32;
        fn IsDialogMessageW(hwnd: HWND, msg: *const MSG) -> i32;
    }

    #[link(name = "comdlg32")]
    extern "system" {
        fn GetOpenFileNameW(ofn: *mut OPENFILENAMEW) -> i32;
    }

    #[link(name = "gdi32")]
    extern "system" {
        fn CreateFontW(height: i32, width: i32, escape: i32, orient: i32, weight: i32, italic: u32, underline: u32, strike: u32, charset: u32, out: u32, clip: u32, quality: u32, pitch: u32, face: *const u16) -> HFONT;
        fn CreateSolidBrush(color: u32) -> HBRUSH;
        fn CreateCompatibleDC(dc: HDC) -> HDC;
        fn CreateCompatibleBitmap(dc: HDC, w: i32, h: i32) -> HGDIOBJ;
        fn SelectObject(dc: HDC, object: HGDIOBJ) -> HGDIOBJ;
        fn DeleteObject(object: HGDIOBJ) -> i32;
        fn DeleteDC(dc: HDC) -> i32;
        fn BitBlt(to: HDC, x: i32, y: i32, w: i32, h: i32, from: HDC, sx: i32, sy: i32, rop: u32) -> i32;
    }
}
