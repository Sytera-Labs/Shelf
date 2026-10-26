import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  TAG_COLORS,
  collectMedals,
  draftFromGame,
  emptyDraft,
  fileToCover,
  formatExact,
  sessionSeconds,
  tagColor,
  tagKey,
  useShelf,
  visibleGames,
  type Draft,
  type Game,
  type Settings,
  type ShelfNotice,
  type ShelfView,
} from "@/lib/library";
import { fill, formatDuration, useCopy, type Copy } from "@/lib/i18n";
import { aboutChrome, APACHE_CANON, orderedLaws } from "@/lib/legal";
import { LOCALES, hydrateLocale, setLocale, useLocale, type Locale } from "@/lib/locale";

type ShelfDesktop = {
  pickExe?: () => Promise<string | null>;
  play?: (filePath: string) => Promise<boolean>;
  onExeExit?: (callback: (filePath: string) => void) => () => void;
};

function sameExe(a: string, b: string): boolean {
  const norm = (value: string) => value.trim().replace(/\//g, "\\").replace(/\\+$/, "").toLowerCase();
  return norm(a) === norm(b);
}

function shelfDesktop(): ShelfDesktop | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { shelf?: ShelfDesktop }).shelf ?? null;
}

function pickLaunchFile(input: { current: HTMLInputElement | null }, onPath: (path: string) => void) {
  const desktop = shelfDesktop();
  if (desktop?.pickExe) {
    void desktop.pickExe().then((picked) => {
      if (picked) onPath(picked);
    });
    return;
  }
  input.current?.click();
}

function ShelfWordmark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="10 22 630 176" role="img" aria-label="Shelf">
      <title>Shelf</title>
      <g fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="butt">
        <path d="M 99.39 110.00 A 42.00 42.00 0 1 1 105.62 57.74" />
        <path d="M 99.39 110.00 A 42.00 42.00 0 1 1 32.92 159.72" />
        <g transform="translate(24 0)">
          <path d="M 188.00 38.00 L 188.00 182.00" />
          <path d="M 188.00 134.00 A 32.00 32.00 0 0 1 252.00 134.00" />
          <path d="M 252.00 134.00 L 252.00 182.00" />
        </g>
        <g transform="translate(70 0)">
          <path d="M 325.50 169.85 A 34.00 34.00 0 1 1 325.50 114.15" />
          <path d="M 275.00 142.00 L 337.00 142.00" />
        </g>
        <g transform="translate(112 0)">
          <path d="M 356.00 38.00 L 356.00 182.00" />
        </g>
        <g transform="translate(162 0)">
          <path d="M 384.00 64.00 A 26.00 26.00 0 1 1 434.73 72.03" />
          <path d="M 384.00 64.00 L 384.00 182.00" />
          <path d="M 370.00 142.00 L 418.00 142.00" />
        </g>
      </g>
      <g fill="currentColor">
        <circle cx="105.62" cy="57.74" r="10" />
        <circle cx="32.92" cy="159.72" r="10" />
        <g transform="translate(24 0)">
          <circle cx="188" cy="38" r="10" />
          <circle cx="188" cy="182" r="10" />
          <circle cx="252" cy="182" r="10" />
        </g>
        <g transform="translate(70 0)">
          <circle cx="325.5" cy="169.85" r="10" />
          <circle cx="325.5" cy="114.15" r="10" />
          <circle cx="337" cy="142" r="10" />
        </g>
        <g transform="translate(112 0)">
          <circle cx="356" cy="38" r="10" />
          <circle cx="356" cy="182" r="10" />
        </g>
        <g transform="translate(162 0)">
          <circle cx="434.73" cy="72.03" r="10" />
          <circle cx="384" cy="182" r="10" />
          <circle cx="370" cy="142" r="10" />
          <circle cx="418" cy="142" r="10" />
        </g>
      </g>
    </svg>
  );
}

export function ShelfApp() {
  const ready = useHydrateShelf();
  const view = useShelf((s) => s.view);
  const selectedId = useShelf((s) => s.selectedId);
  const games = useShelf((s) => s.games);
  const session = useShelf((s) => s.session);
  const notice = useShelf((s) => s.notice);
  const settings = useShelf((s) => s.settings);
  const selected = games.find((game) => game.id === selectedId) ?? null;

  useEffect(() => {
    const beat = window.setInterval(() => {
      const current = useShelf.getState().session;
      if (!current) return;
      useShelf.setState({ session: { ...current, lastBeat: Date.now() } });
    }, 1000);
    const end = () => {
      if (useShelf.getState().session) useShelf.getState().stopSession();
    };
    window.addEventListener("pagehide", end);
    const desktop = shelfDesktop();
    const offExit = desktop?.onExeExit?.((filePath) => {
      const state = useShelf.getState();
      const current = state.session;
      if (!current) return;
      const game = state.games.find((item) => item.id === current.gameId);
      if (!game?.exePath || !sameExe(game.exePath, filePath)) return;
      state.stopSession();
    });
    return () => {
      window.clearInterval(beat);
      window.removeEventListener("pagehide", end);
      offExit?.();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("motion", settings.motion);
  }, [settings.motion]);

  if (!ready) return <div className="min-h-dvh bg-bg" />;

  return (
    <div className="min-h-dvh overflow-x-clip bg-bg text-fg">
      <Masthead />
      <main key={selected ? `game-${selected.id}` : view} className={`${settings.motion ? "rise" : ""} mx-auto w-full min-w-0 max-w-6xl px-4 pb-24 sm:px-6`}>
        {selected ? <GamePage game={selected} /> : view === "tags" ? <TagsView /> : view === "medals" ? <MedalsView /> : view === "settings" ? <SettingsView /> : view === "about" ? <AboutView /> : <LibraryView />}
      </main>
      {session ? <SessionBar /> : null}
      {notice ? <Notice /> : null}
      <EditorDialog />
      <DeleteDialog />
    </div>
  );
}

function useHydrateShelf() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void Promise.resolve(useShelf.persist.rehydrate()).then(async () => {
      await hydrateLocale();
      try {
        await Promise.race([
          document.fonts.load('42px "Noto Sans JP"', "Shelf АБВГД"),
          new Promise((resolve) => window.setTimeout(resolve, 400)),
        ]);
      } catch {
        /* reading face still falls back */
      }
      if (useShelf.getState().session) useShelf.getState().settleInterrupted();
      useShelf.getState().seedIfNeeded();
      setReady(true);
    });
  }, []);
  return ready;
}

function Masthead() {
  const view = useShelf((s) => s.view);
  const setView = useShelf((s) => s.setView);
  const query = useShelf((s) => s.query);
  const setQuery = useShelf((s) => s.setQuery);
  const openCreate = useShelf((s) => s.openCreate);
  const medalsOn = useShelf((s) => s.settings.medalsOn);
  const copy = useCopy();
  const nav: { id: ShelfView; label: string }[] = [
    { id: "library", label: copy.nav.library },
    { id: "recent", label: copy.nav.recent },
    { id: "tags", label: copy.nav.tags },
    { id: "medals", label: copy.nav.medals },
    { id: "settings", label: copy.nav.settings },
    { id: "about", label: copy.nav.about },
  ].filter((item): item is { id: ShelfView; label: string } => item.id !== "medals" || medalsOn);

  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <ShelfWordmark className="brand-word" />
            <p className="text-sm text-muted">{copy.madeBy}</p>
            <p className="text-xs text-faint">{copy.version}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={openCreate} className="gloss h-11 rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg">
              {copy.newCard}
            </button>
            <LangButton />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`nav-link shrink-0 border-b-2 px-3 py-2 text-sm ${view === item.id ? "border-accent font-semibold text-fg" : "border-transparent text-muted"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.search}
            className="h-11 min-w-0 flex-1 border-b border-line bg-transparent text-base outline-none placeholder:text-faint"
          />
        </div>
      </div>
    </header>
  );
}

function LangButton() {
  const locale = useLocale();
  const copy = useCopy();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((item) => item.id === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={copy.langLabel}
        onClick={() => setOpen((value) => !value)}
        className="h-11 min-w-16 border border-line bg-raised px-3 text-sm"
      >
        {current.code}
      </button>
      {open ? (
        <ul role="listbox" aria-label={copy.langLabel} className="absolute right-0 z-30 mt-1 max-h-[70dvh] w-56 overflow-y-auto border border-line bg-raised py-1">
          {LOCALES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={item.id === locale}
                className={`flex h-11 w-full items-center justify-between gap-3 px-3 text-left text-sm ${item.id === locale ? "text-accent" : "text-fg"}`}
                onClick={() => {
                  setLocale(item.id as Locale);
                  setOpen(false);
                }}
              >
                <span>{item.name}</span>
                <span className="text-faint">{item.code}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function LibraryView() {
  const games = useShelf((s) => s.games);
  const folders = useShelf((s) => s.folders);
  const view = useShelf((s) => s.view);
  const query = useShelf((s) => s.query);
  const activeTag = useShelf((s) => s.activeTag);
  const setActiveTag = useShelf((s) => s.setActiveTag);
  const settings = useShelf((s) => s.settings);
  const tagbook = useShelf((s) => s.tagbook);
  const createFolder = useShelf((s) => s.createFolder);
  const renameFolder = useShelf((s) => s.renameFolder);
  const deleteFolder = useShelf((s) => s.deleteFolder);
  const groupCards = useShelf((s) => s.groupCards);
  const moveGame = useShelf((s) => s.moveGame);
  const copy = useCopy();
  const locale = useLocale();
  const shown = useMemo(() => visibleGames(games, view, query, activeTag, locale), [games, view, query, activeTag, locale]);
  const [naming, setNaming] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [drag, setDrag] = useState<CardDrag | null>(null);
  const dragRef = useRef<CardDrag | null>(null);

  const sections = useMemo(() => {
    if (view !== "library") return [{ id: "", name: "", games: shown }];
    const buckets = new Map(folders.map((folder) => [folder.id, [] as Game[]]));
    const loose: Game[] = [];
    for (const game of shown) {
      if (game.folderId && buckets.has(game.folderId)) buckets.get(game.folderId)?.push(game);
      else loose.push(game);
    }
    return [
      ...folders.map((folder) => ({ id: folder.id, name: folder.name, games: buckets.get(folder.id) ?? [] })),
      { id: "", name: "", games: loose },
    ];
  }, [folders, shown, view]);

  function commitFolder(event: FormEvent) {
    event.preventDefault();
    if (createFolder(folderName)) {
      setFolderName("");
      setNaming(false);
    }
  }

  function armCard(id: string, event: ReactPointerEvent) {
    if (event.button !== 0) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const session = { id, x: startX, y: startY, overGame: null as string | null, overSection: null as string | null, moved: false };
    dragRef.current = session;
    const move = (ev: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      if (!current.moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
      current.moved = true;
      const hit = hitCard(ev.clientX, ev.clientY, current.id);
      current.x = ev.clientX;
      current.y = ev.clientY;
      current.overGame = hit.gameId;
      current.overSection = hit.section;
      setDrag({ ...current });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!current?.moved) return;
      const source = document.querySelector(`[data-game-id="${CSS.escape(current.id)}"]`);
      if (source instanceof HTMLElement) source.dataset.suppress = "1";
      const hit = hitCard(ev.clientX, ev.clientY, current.id);
      if (hit.gameId) {
        const result = groupCards(current.id, hit.gameId, copy.folder);
        if (result?.created) {
          setRenamingId(result.folderId);
          setRenameValue(result.name);
        }
        return;
      }
      if (hit.section) {
        const beforeId = nearestCard(ev.clientX, ev.clientY, hit.section, current.id);
        moveGame(current.id, hit.section === "loose" ? null : hit.section, beforeId);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const dragged = games.find((game) => game.id === drag?.id) ?? null;

  return (
    <section className="pt-8">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-medium tracking-tight">{view === "recent" ? copy.nav.recent : copy.nav.library}</h1>
        <div className="flex flex-wrap items-center gap-3">
          {view === "library" ? (
            <button type="button" className="h-11 border border-line px-3 text-sm" onClick={() => setNaming(true)}>
              {copy.newFolder}
            </button>
          ) : null}
          {activeTag ? (
            <button type="button" className="text-sm text-accent" onClick={() => setActiveTag(null)}>
              {fill(copy.clearTag, { tag: activeTag })}
            </button>
          ) : (
            <p className="text-sm text-muted">{fill(copy.onShelf, { n: shown.length })}</p>
          )}
        </div>
      </div>
      {naming && view === "library" ? (
        <form className="mb-6 flex flex-col gap-2 border border-line bg-raised p-4 sm:flex-row sm:items-end" onSubmit={commitFolder}>
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
            <span className="text-muted">{copy.folder}</span>
            <input
              autoFocus
              value={folderName}
              maxLength={48}
              onChange={(event) => setFolderName(event.target.value)}
              className="h-11 border-b border-line bg-transparent outline-none"
            />
          </label>
          <button type="submit" className="h-11 bg-accent px-4 text-sm font-medium text-accent-fg">
            {copy.save}
          </button>
          <button
            type="button"
            className="h-11 px-3 text-sm text-muted"
            onClick={() => {
              setNaming(false);
              setFolderName("");
            }}
          >
            {copy.cancel}
          </button>
        </form>
      ) : null}
      {shown.length === 0 && folders.length === 0 ? (
        <p className="max-w-md py-16 text-muted">{games.length === 0 ? copy.empty : copy.none}</p>
      ) : (
        sections.map((section) => {
          if (!section.id && (view !== "library" || folders.length === 0)) {
            if (section.games.length === 0) return shown.length === 0 ? <p key="none" className="max-w-md py-16 text-muted">{copy.none}</p> : null;
            return (
              <div key="all" data-shelf-section="loose">
                <GameGrid games={section.games} settings={settings} tagbook={tagbook} locale={locale} copy={copy} drag={drag} onArm={armCard} />
              </div>
            );
          }
          if (!section.id) {
            if (section.games.length === 0 && drag?.overSection !== "loose") return null;
            return (
              <div key="loose" data-shelf-section="loose" className={`mt-10 ${drag?.overSection === "loose" && !drag.overGame ? "shelf-drop" : ""}`}>
                <h2 className="mb-4 text-sm text-muted">{copy.outsideFolders}</h2>
                <GameGrid games={section.games} settings={settings} tagbook={tagbook} locale={locale} copy={copy} drag={drag} onArm={armCard} />
              </div>
            );
          }
          return (
            <div key={section.id} data-shelf-section={section.id} className={`mt-8 ${drag?.overSection === section.id && !drag.overGame ? "shelf-drop" : ""}`}>
              <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-line pb-2">
                {renamingId === section.id ? (
                  <form
                    className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      renameFolder(section.id, renameValue);
                      setRenamingId(null);
                    }}
                  >
                    <input
                      autoFocus
                      value={renameValue}
                      maxLength={48}
                      onChange={(event) => setRenameValue(event.target.value)}
                      className="h-11 min-w-0 flex-1 border-b border-line bg-transparent text-lg outline-none"
                    />
                    <button type="submit" className="h-11 px-3 text-sm text-accent">
                      {copy.save}
                    </button>
                  </form>
                ) : (
                  <h2 className="min-w-0 flex-1 truncate text-lg font-medium">{section.name}</h2>
                )}
                <button
                  type="button"
                  className="h-11 px-2 text-sm text-muted"
                  onClick={() => {
                    setRenamingId(section.id);
                    setRenameValue(section.name);
                  }}
                >
                  {copy.rename}
                </button>
                <button type="button" className="h-11 px-2 text-sm text-danger" onClick={() => deleteFolder(section.id)}>
                  {copy.removeFolder}
                </button>
              </div>
              {section.games.length || drag?.overSection === section.id ? (
                <GameGrid games={section.games} settings={settings} tagbook={tagbook} locale={locale} copy={copy} drag={drag} onArm={armCard} />
              ) : null}
            </div>
          );
        })
      )}
      {drag && dragged ? (
        <div className="drag-ghost" style={{ left: drag.x + 14, top: drag.y + 14 }}>
          <span className="case-cover sheen block">
            {settings.showCovers && dragged.cover ? <img src={dragged.cover} alt="" className="size-full object-cover" /> : <span className="block size-full bg-accent" />}
          </span>
          <span className="mt-1 block truncate text-xs">{dragged.title}</span>
        </div>
      ) : null}
    </section>
  );
}

type CardDrag = { id: string; x: number; y: number; overGame: string | null; overSection: string | null; moved: boolean };

function hitCard(x: number, y: number, selfId: string): { gameId: string | null; section: string | null } {
  const el = document.elementFromPoint(x, y);
  const card = el?.closest("[data-game-id]");
  const gameId = card?.getAttribute("data-game-id") ?? null;
  if (gameId === selfId) return { gameId: null, section: null };
  const section = el?.closest("[data-shelf-section]")?.getAttribute("data-shelf-section") ?? null;
  if (gameId) return { gameId, section };
  return { gameId: null, section };
}

function nearestCard(x: number, y: number, section: string, selfId: string): string | null {
  const root = document.querySelector(`[data-shelf-section="${CSS.escape(section)}"]`);
  if (!root) return null;
  const cards = [...root.querySelectorAll("[data-game-id]")].filter((node) => node.getAttribute("data-game-id") !== selfId);
  let best: { id: string; dist: number; before: boolean } | null = null;
  for (const card of cards) {
    const id = card.getAttribute("data-game-id");
    if (!id) continue;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(x - cx, y - cy);
    const before = y < cy || (Math.abs(y - cy) < rect.height / 2 && x < cx);
    if (!best || dist < best.dist) best = { id, dist, before };
  }
  if (!best) return null;
  if (best.before) return best.id;
  const ids = cards.map((card) => card.getAttribute("data-game-id")).filter((id): id is string => Boolean(id));
  const index = ids.indexOf(best.id);
  return ids[index + 1] ?? null;
}

function GameGrid({ games, settings, tagbook, locale, copy, drag, onArm }: { games: Game[]; settings: Settings; tagbook: { name: string; color: string }[]; locale: ReturnType<typeof useLocale>; copy: ReturnType<typeof useCopy>; drag: CardDrag | null; onArm: (id: string, event: ReactPointerEvent) => void }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {games.map((game, index) => (
        <Spine
          key={game.id}
          game={game}
          settings={settings}
          color={game.tags[0] ? tagColor(tagbook, game.tags[0]) : "var(--color-accent)"}
          delay={settings.motion && !drag ? index * 36 : 0}
          locale={locale}
          copy={copy}
          dim={drag?.id === game.id}
          target={drag?.overGame === game.id}
          onArm={onArm}
        />
      ))}
    </div>
  );
}

function Spine({ game, settings, color, delay, locale, copy, dim, target, onArm }: { game: Game; settings: Settings; color: string; delay: number; locale: ReturnType<typeof useLocale>; copy: ReturnType<typeof useCopy>; dim: boolean; target: boolean; onArm: (id: string, event: ReactPointerEvent) => void }) {
  const select = useShelf((s) => s.select);
  const tagbook = useShelf((s) => s.tagbook);
  return (
    <button
      type="button"
      data-game-id={game.id}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      onPointerDown={(event) => onArm(game.id, event)}
      onClick={(event) => {
        if (event.currentTarget.dataset.suppress === "1") {
          delete event.currentTarget.dataset.suppress;
          event.preventDefault();
          return;
        }
        select(game.id);
      }}
      className={`case ${settings.motion && !dim ? "rise" : ""} ${dim ? "is-source" : ""} ${target ? "is-drop" : ""}`}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {settings.showCovers && game.cover ? (
        <span className="case-cover sheen">
          <img src={game.cover} alt="" draggable={false} className="size-full object-cover" />
        </span>
      ) : (
        <span className="case-cover sheen" style={{ background: color }} />
      )}
      <span className="min-w-0 px-0.5">
        <span className="block truncate text-sm font-medium leading-tight">{game.title}</span>
        {game.tags.length ? (
          <span className="mt-2 flex flex-wrap gap-1">
            {game.tags.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 text-xs text-accent-fg" style={{ background: tagColor(tagbook, tag) }}>
                {tag}
              </span>
            ))}
          </span>
        ) : null}
        {settings.showHours ? <span className="mt-2 block text-xs tabular-nums text-muted">{formatDuration(game.playSeconds, copy, locale)}</span> : null}
      </span>
    </button>
  );
}


function FolderPick({
  value,
  folders,
  none,
  onChange,
}: {
  value: string | null;
  folders: { id: string; name: string }[];
  none: string;
  onChange: (id: string | null) => void;
}) {
  return (
    <div className="shelf-select flex max-h-40 flex-col overflow-y-auto" role="listbox">
      <button type="button" role="option" aria-selected={!value} className={`shelf-option px-3 py-2 text-left text-sm ${value ? "" : "is-on"}`} onClick={() => onChange(null)}>
        {none}
      </button>
      {folders.map((folder) => (
        <button
          key={folder.id}
          type="button"
          role="option"
          aria-selected={value === folder.id}
          className={`shelf-option px-3 py-2 text-left text-sm ${value === folder.id ? "is-on" : ""}`}
          onClick={() => onChange(folder.id)}
        >
          {folder.name}
        </button>
      ))}
    </div>
  );
}

function GamePage({ game }: { game: Game }) {
  const select = useShelf((s) => s.select);
  const askDelete = useShelf((s) => s.askDelete);
  const remove = useShelf((s) => s.remove);
  const startSession = useShelf((s) => s.startSession);
  const openEdit = useShelf((s) => s.openEdit);
  const saveDraft = useShelf((s) => s.saveDraft);
  const setGameFolder = useShelf((s) => s.setGameFolder);
  const folders = useShelf((s) => s.folders);
  const settings = useShelf((s) => s.settings);
  const tagbook = useShelf((s) => s.tagbook);
  const playing = useShelf((s) => s.session)?.gameId === game.id;
  const copy = useCopy();
  const inputRef = useRef<HTMLInputElement>(null);
  const [opening, setOpening] = useState(false);

  async function onCover(file: File | null) {
    if (!file) return;
    try {
      const cover = await fileToCover(file);
      saveDraft({ ...draftFromGame(game), cover }, game.id);
    } catch {
      useShelf.setState({ notice: { key: "coverFail" } });
    }
  }

  return (
    <article className="grid min-w-0 gap-8 pt-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <div className="min-w-0">
        {settings.showCovers && game.cover ? (
          <img src={game.cover} alt="" className="cover-frame w-full object-cover" />
        ) : (
          <div className="cover-frame flex items-end overflow-hidden bg-panel p-4">
            <p className="title-wrap line-clamp-6 text-2xl font-medium leading-tight">{game.title}</p>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <button type="button" onClick={() => select(null)} className="text-sm text-muted">
          {copy.back}
        </button>
        <h1 className="title-wrap mt-3 text-4xl font-medium leading-tight tracking-tight">{game.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {game.tags.map((tag) => (
            <span key={tag} className="rounded-sm px-2 py-1 text-xs text-accent-fg" style={{ background: tagColor(tagbook, tag) }}>
              {tag}
            </span>
          ))}
        </div>
        {settings.showHours ? <p className="mt-4 tabular-nums text-muted">{fill(copy.inCatalog, { time: formatExact(game.playSeconds) })}</p> : null}
        {game.exePath ? <p className="mt-4 break-all text-sm text-muted">{game.exePath}</p> : <p className="mt-4 text-sm text-muted">{copy.noExe}</p>}
        <label className="mt-5 flex max-w-xs flex-col gap-1 text-sm">
          <span className="text-muted">{copy.folder}</span>
          <FolderPick value={game.folderId} folders={folders} none={copy.noFolder} onChange={(folderId) => setGameFolder(game.id, folderId)} />
        </label>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!game.exePath || playing || opening}
            onClick={() => {
              const desktop = shelfDesktop();
              if (desktop?.play && game.exePath) {
                setOpening(true);
                void desktop.play(game.exePath).then((ok) => {
                  setOpening(false);
                  if (!ok) {
                    useShelf.setState({ notice: { key: "launchFail" } });
                    return;
                  }
                  startSession(game.id);
                });
                return;
              }
              startSession(game.id);
            }}
            className="gloss h-12 bg-accent px-5 text-sm font-semibold text-accent-fg disabled:opacity-40"
          >
            {playing ? copy.sessionOn : copy.play}
          </button>
          <button type="button" onClick={() => openEdit(game.id)} className="h-12 border border-line bg-raised px-4 text-sm">
            {copy.edit}
          </button>
          <button type="button" onClick={() => inputRef.current?.click()} className="h-12 border border-line bg-raised px-4 text-sm">
            {copy.changeCover}
          </button>
          <button
            type="button"
            onClick={() => (settings.confirmDelete ? askDelete(game.id) : remove(game.id))}
            className="h-12 px-4 text-sm text-danger"
          >
            {copy.removeCard}
          </button>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => void onCover(event.target.files?.[0] ?? null)} />
        </div>
      </div>
    </article>
  );
}

function TagsView() {
  const tagbook = useShelf((s) => s.tagbook);
  const games = useShelf((s) => s.games);
  const addTag = useShelf((s) => s.addTag);
  const recolorTag = useShelf((s) => s.recolorTag);
  const deleteTag = useShelf((s) => s.deleteTag);
  const setActiveTag = useShelf((s) => s.setActiveTag);
  const copy = useCopy();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(TAG_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="pt-8">
      <h1 className="text-2xl font-medium tracking-tight">{copy.nav.tags}</h1>
      <p className="mt-2 max-w-lg text-sm text-muted">{copy.tagsHelp}</p>
      <form
        className="mt-6 flex flex-col gap-3 border border-line bg-raised p-4 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          const message = addTag(name, color);
          setError(message ? copy.err[message] : null);
          if (!message) setName("");
        }}
      >
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-muted">{copy.name}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className="h-11 border-b border-line bg-transparent outline-none" />
        </label>
        <Swatches value={color} onChange={setColor} />
        <button type="submit" className="gloss h-11 bg-accent px-4 text-sm font-medium text-accent-fg">
          {copy.addTag}
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <ul className="mt-6 flex flex-col gap-3">
        {tagbook.length === 0 ? <li className="text-sm text-muted">{copy.noTags}</li> : null}
        {tagbook.map((tag) => {
          const count = games.filter((game) => game.tags.some((item) => tagKey(item) === tagKey(tag.name))).length;
          return (
            <li key={tag.name} className="flex flex-col gap-3 border border-line bg-raised p-4 sm:flex-row sm:items-center">
              <button type="button" onClick={() => setActiveTag(tag.name)} className="flex items-center gap-3 text-left">
                <span className="size-4" style={{ background: tag.color }} />
                <span className="font-medium">{tag.name}</span>
                <span className="text-sm text-muted">{count}</span>
              </button>
              <div className="sm:ml-auto">
                <Swatches value={tag.color} onChange={(next) => recolorTag(tag.name, next)} />
              </div>
              <button type="button" className="text-sm text-danger" onClick={() => deleteTag(tag.name)}>
                {copy.delete}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Swatches({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex gap-2">
      {TAG_COLORS.map((swatch) => (
        <button
          key={swatch}
          type="button"
          aria-label={swatch}
          onClick={() => onChange(swatch)}
          className={`size-8 rounded-full border-2 ${value === swatch ? "border-fg" : "border-transparent"}`}
          style={{ background: swatch }}
        />
      ))}
    </div>
  );
}

function MedalsView() {
  const games = useShelf((s) => s.games);
  const tagbook = useShelf((s) => s.tagbook);
  const copy = useCopy();
  const medals = useMemo(() => collectMedals(games, tagbook), [games, tagbook]);
  const earned = medals.filter((medal) => medal.earned).length;
  return (
    <section className="pt-8">
      <h1 className="text-2xl font-medium tracking-tight">{copy.nav.medals}</h1>
      <p className="mt-2 text-sm text-muted">
        {fill(copy.earned, { earned, total: medals.length })}
        {". "}
        {copy.medalHelp}
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {medals.map((medal) => {
          const text = copy.medals[medal.id];
          return (
            <li key={medal.id} className={`ach-card sheen flex items-center gap-4 border border-line p-4 ${medal.earned ? "earned bg-raised" : "bg-panel opacity-60"}`}>
              <Seal mark={medal.mark} earned={medal.earned} />
              <div>
                <p className="font-medium">{text.title}</p>
                <p className="text-sm text-muted">{text.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Seal({ mark, earned }: { mark: string; earned: boolean }) {
  const metal = earned ? "#d7c7a1" : "#3a4246";
  const face = earned ? "#15181b" : "#101214";
  const ink = earned ? "#f3f5f5" : "#5c6568";
  return (
    <svg viewBox="0 0 72 88" className="size-16 shrink-0" aria-hidden="true">
      <path d="M22 46h10l-1 36h-8zm18 0h10l-1 36h-8z" fill={earned ? "#39c5bb" : "#2a3033"} />
      <circle cx="36" cy="34" r="28" fill={metal} />
      <circle cx="36" cy="34" r="22" fill={face} />
      <circle cx="36" cy="34" r="18" fill="none" stroke={metal} strokeWidth="1.2" />
      <text x="36" y="39" textAnchor="middle" fontFamily="Noto Sans JP, sans-serif" fontSize="13" fill={ink}>
        {mark}
      </text>
    </svg>
  );
}

function AboutView() {
  const copy = useCopy();
  const locale = useLocale();
  const chrome = aboutChrome[locale];
  const sections = orderedLaws(locale);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [apacheOpen, setApacheOpen] = useState(false);
  return (
    <section className="max-w-3xl pt-8 pb-16">
      <h1 className="text-2xl font-medium tracking-tight">{copy.aboutTitle}</h1>
      <ShelfWordmark className="brand-word mt-6" />
      <p className="mt-3 text-sm text-muted">{copy.madeBy}</p>
      <p className="mt-1 text-xs text-faint">{copy.version}</p>
      <p className="mt-6 text-sm leading-relaxed text-muted">{copy.aboutLead}</p>
      <p className="mt-4 text-sm leading-relaxed text-faint">{chrome.lawOrder}</p>
      <h2 className="mt-10 text-lg font-medium tracking-tight">{copy.privacyHeading}</h2>
      {sections.map((law, index) => {
        const shown = open[law.place] === true;
        return (
          <article key={law.place} className={`mt-6 border-t pt-5 ${index === 0 ? "border-accent" : "border-line"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-base font-medium">{law.place}</h3>
                {index === 0 ? <p className="mt-2 text-xs leading-relaxed text-faint">{chrome.currentMark}</p> : null}
                <p className="mt-3 text-sm leading-relaxed">{law.acts}</p>
              </div>
              <button
                type="button"
                aria-expanded={shown}
                onClick={() => setOpen((state) => ({ ...state, [law.place]: !state[law.place] }))}
                className="h-11 shrink-0 border border-line px-3 text-sm text-accent"
              >
                {shown ? copy.collapse : copy.expand}
              </button>
            </div>
            {shown ? (
              <div>
                <h4 className="mt-4 text-xs tracking-wide text-accent">{chrome.lawTechnical}</h4>
                <p className="mt-1 text-sm leading-relaxed text-muted">{law.technical}</p>
                <h4 className="mt-4 text-xs tracking-wide text-accent">{chrome.lawLegal}</h4>
                <p className="mt-1 text-sm leading-relaxed text-muted">{law.legal}</p>
                <h4 className="mt-4 text-xs tracking-wide text-accent">{chrome.lawLanguage}</h4>
                <p className="mt-1 text-sm leading-relaxed text-muted">{law.language}</p>
                <h4 className="mt-4 text-xs tracking-wide text-accent">{chrome.lawUser}</h4>
                <p className="mt-1 text-sm leading-relaxed text-muted">{law.user}</p>
              </div>
            ) : null}
          </article>
        );
      })}
      <h2 className="mt-10 text-lg font-medium tracking-tight">{copy.copyHeading}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{copy.copyBody}</p>
      <p className="mt-4 text-xs leading-relaxed text-faint">{copy.disclaimer}</p>
      <section className="mt-12 border border-line bg-panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-medium tracking-tight">{chrome.apacheHeading}</h2>
            <p className="mt-2 text-sm leading-relaxed">{chrome.apacheReleased}</p>
          </div>
          <button type="button" aria-expanded={apacheOpen} onClick={() => setApacheOpen((value) => !value)} className="h-11 shrink-0 border border-line px-3 text-sm text-accent">
            {apacheOpen ? copy.collapse : copy.expand}
          </button>
        </div>
        {apacheOpen ? (
          <div>
            {chrome.apache.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="mt-3 text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
            <pre className="mt-5 overflow-x-auto border border-line bg-bg p-4 text-xs leading-relaxed text-muted whitespace-pre-wrap">{APACHE_CANON}</pre>
          </div>
        ) : null}
      </section>
    </section>
  );
}

function SettingsView() {
  const settings = useShelf((s) => s.settings);
  const setSetting = useShelf((s) => s.setSetting);
  const copy = useCopy();
  return (
    <section className="pt-8">
      <h1 className="text-2xl font-medium tracking-tight">{copy.nav.settings}</h1>
      <ul className="mt-6 flex flex-col border-t border-line">
        {copy.rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-4 border-b border-line py-4">
            <div>
              <p className="font-medium">{row.label}</p>
              <p className="max-w-md text-sm text-muted">{row.hint}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings[row.key]}
              onClick={() => setSetting(row.key, !settings[row.key])}
              className={`relative h-8 w-14 shrink-0 rounded-full ${settings[row.key] ? "bg-accent" : "bg-line"}`}
            >
              <span className={`switch-knob absolute top-1 size-6 rounded-full bg-ink ${settings[row.key] ? "left-7" : "left-1"}`} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SessionBar() {
  const session = useShelf((s) => s.session);
  const games = useShelf((s) => s.games);
  const stopSession = useShelf((s) => s.stopSession);
  const copy = useCopy();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);
  if (!session) return null;
  const game = games.find((item) => item.id === session.gameId);
  const seconds = sessionSeconds(session.startedAt, now);
  return (
    <div className="session-bar fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-line bg-panel px-4 py-3 sm:px-6">
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-medium">{game?.title ?? copy.sessionFallback}</p>
        <p className="text-xs text-muted">{copy.sessionSince}</p>
      </div>
      <p className="shrink-0 tabular-nums text-lg">{formatExact(seconds)}</p>
      <button type="button" onClick={stopSession} className="gloss h-11 shrink-0 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">
        {copy.closeSession}
      </button>
    </div>
  );
}

function noticeText(notice: Exclude<ShelfNotice, null>, copy: Copy): string {
  if (notice.key === "imported") return fill(copy.err.imported, { n: notice.count });
  return copy.err[notice.key];
}

function Notice() {
  const notice = useShelf((s) => s.notice);
  const clearNotice = useShelf((s) => s.clearNotice);
  const copy = useCopy();
  if (!notice) return null;
  return (
    <div className="fixed right-4 bottom-20 z-30 flex max-w-sm items-start gap-3 border border-line bg-raised p-3 text-sm">
      <p>{noticeText(notice, copy)}</p>
      <button type="button" onClick={clearNotice} aria-label={copy.close}>
        {copy.close}
      </button>
    </div>
  );
}

function EditorDialog() {
  const editor = useShelf((s) => s.editor);
  const closeEditor = useShelf((s) => s.closeEditor);
  const saveDraft = useShelf((s) => s.saveDraft);
  const tagbook = useShelf((s) => s.tagbook);
  const folders = useShelf((s) => s.folders);
  const motion = useShelf((s) => s.settings.motion);
  const copy = useCopy();
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const exeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editor) return;
    const current = editor.mode === "edit" ? useShelf.getState().games.find((item) => item.id === editor.id) : null;
    setError(null);
    setDraft(current ? draftFromGame(current) : emptyDraft());
  }, [editor]);

  const selected = new Set(draft.tags.split(/[,;]/).map((part) => tagKey(part)).filter(Boolean));

  function toggleTag(name: string) {
    const key = tagKey(name);
    const names = draft.tags.split(/[,;]/).map((part) => part.trim()).filter(Boolean);
    const next = names.some((item) => tagKey(item) === key) ? names.filter((item) => tagKey(item) !== key) : [...names, name];
    setDraft({ ...draft, tags: next.join(", ") });
  }

  return (
    <Dialog.Root open={editor !== null} onOpenChange={(open) => { if (!open) closeEditor(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content className={`fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-line bg-raised p-5 ${motion ? "dialog-in" : ""}`}>
          <Dialog.Title className="text-2xl font-medium tracking-tight">{editor?.mode === "edit" ? copy.editCard : copy.newCard}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted">{copy.coverNote}</Dialog.Description>
          <form
            className="mt-5 flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const result = saveDraft(draft, editor?.mode === "edit" ? editor.id : undefined);
              setError(result ? copy.err[result] : null);
            }}
          >
            <Field label={copy.title} value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{copy.folder}</span>
              <FolderPick value={draft.folderId} folders={folders} none={copy.noFolder} onChange={(folderId) => setDraft({ ...draft, folderId })} />
            </label>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted">{copy.exe}</span>
              <div className="flex items-end gap-2">
                <input
                  value={draft.exePath}
                  placeholder={copy.exePh}
                  onChange={(event) => setDraft({ ...draft, exePath: event.target.value })}
                  className="h-11 min-w-0 flex-1 border-b border-line bg-transparent outline-none placeholder:text-faint"
                />
                <button type="button" onClick={() => void pickLaunchFile(exeRef, (picked) => setDraft((current) => ({ ...current, exePath: picked })))} className="h-11 shrink-0 border border-line px-3 text-sm">
                  {copy.browse}
                </button>
              </div>
              <p className="text-xs leading-relaxed text-faint">{copy.pathHint}</p>
              <input
                ref={exeRef}
                type="file"
                accept=".exe,application/x-msdownload,application/octet-stream"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const picked = (file as File & { path?: string }).path || file.name;
                  setDraft((current) => ({ ...current, exePath: picked }));
                  event.target.value = "";
                }}
              />
            </div>
            <div>
              <p className="text-sm text-muted">{copy.tags}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tagbook.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`border px-2 py-1 text-sm ${selected.has(tagKey(tag.name)) ? "border-accent text-accent" : "border-line text-muted"}`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              <input
                value={draft.tags}
                onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
                placeholder={copy.tagsPh}
                className="mt-2 h-11 w-full border-b border-line bg-transparent text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => inputRef.current?.click()} className="h-11 border border-line px-3 text-sm">
                {copy.ownCover}
              </button>
              {draft.cover ? <img src={draft.cover} alt="" className="h-16 w-11 object-cover" /> : null}
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void fileToCover(file)
                    .then((cover) => setDraft((current) => ({ ...current, cover })))
                    .catch(() => setError(copy.err.coverFail));
                }}
              />
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={closeEditor} className="h-11 px-4 text-sm text-muted">
                {copy.cancel}
              </button>
              <button type="submit" className="gloss h-11 bg-accent px-4 text-sm font-medium text-accent-fg">
                {copy.save}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="h-11 border-b border-line bg-transparent outline-none placeholder:text-faint" />
    </label>
  );
}

function DeleteDialog() {
  const id = useShelf((s) => s.confirmDeleteId);
  const games = useShelf((s) => s.games);
  const askDelete = useShelf((s) => s.askDelete);
  const remove = useShelf((s) => s.remove);
  const copy = useCopy();
  const game = games.find((item) => item.id === id);
  return (
    <Dialog.Root open={id !== null} onOpenChange={(open) => { if (!open) askDelete(null); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 border border-line bg-raised p-5">
          <Dialog.Title className="text-xl font-medium">{copy.removeAsk}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted">
            {game ? fill(copy.removeBody, { title: game.title }) : copy.removePlain}
          </Dialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => askDelete(null)} className="h-11 px-4 text-sm text-muted">
              {copy.keep}
            </button>
            <button type="button" onClick={() => id && remove(id)} className="h-11 bg-accent px-4 text-sm font-medium text-accent-fg">
              {copy.remove}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
