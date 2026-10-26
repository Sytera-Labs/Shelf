import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type MedalId } from "@/lib/i18n";
import { programStorage } from "@/lib/locale";

export type Game = {
  id: string;
  title: string;
  exePath: string;
  workingDir: string;
  args: string;
  cover: string | null;
  tags: string[];
  folderId: string | null;
  note: string;
  playSeconds: number;
  lastPlayedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ShelfTag = { name: string; color: string };
export type ShelfFolder = { id: string; name: string };

export type Settings = {
  showHours: boolean;
  showCovers: boolean;
  confirmDelete: boolean;
  trackTime: boolean;
  motion: boolean;
  medalsOn: boolean;
};

export type Draft = {
  title: string;
  exePath: string;
  workingDir: string;
  args: string;
  tags: string;
  folderId: string | null;
  note: string;
  cover: string | null;
};

export type ShelfView = "library" | "recent" | "tags" | "medals" | "settings" | "about";

export type Session = {
  gameId: string;
  startedAt: number;
  counting: boolean;
  lastBeat: number;
};

export type ShelfNotice = { key: "timeOff" } | { key: "imported"; count: number } | { key: "importFail" } | { key: "coverFail" } | { key: "launchFail" } | null;
export type FormError = "tagName" | "tagExists" | "needTitle" | "coverFail";

export const TAG_COLORS = ["#39c5bb", "#7aa0c4", "#d08b84", "#c4a574", "#9cbf8a", "#d7c7a1", "#8b9396", "#f3f5f5"] as const;

const defaultSettings = (): Settings => ({
  showHours: true,
  showCovers: true,
  confirmDelete: true,
  trackTime: true,
  motion: true,
  medalsOn: true,
});

type Persisted = {
  games: Game[];
  folders: ShelfFolder[];
  tagbook: ShelfTag[];
  settings: Settings;
  didSeed: boolean;
  session: Session | null;
};

type LibraryState = Persisted & {
  view: ShelfView;
  activeTag: string | null;
  query: string;
  selectedId: string | null;
  editor: { mode: "create" } | { mode: "edit"; id: string } | null;
  confirmDeleteId: string | null;
  notice: ShelfNotice;
  setView: (view: ShelfView) => void;
  setActiveTag: (tag: string | null) => void;
  setQuery: (query: string) => void;
  select: (id: string | null) => void;
  openCreate: () => void;
  openEdit: (id: string) => void;
  closeEditor: () => void;
  askDelete: (id: string | null) => void;
  saveDraft: (draft: Draft, id?: string) => FormError | null;
  remove: (id: string) => void;
  startSession: (id: string) => void;
  stopSession: () => void;
  settleInterrupted: () => void;
  importGames: (games: Game[], tagbook?: ShelfTag[], folders?: ShelfFolder[]) => void;
  clearNotice: () => void;
  seedIfNeeded: () => void;
  addTag: (name: string, color: string) => FormError | null;
  recolorTag: (name: string, color: string) => void;
  deleteTag: (name: string) => void;
  createFolder: (name: string) => string | null;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  setGameFolder: (gameId: string, folderId: string | null) => void;
  groupCards: (sourceId: string, targetId: string, baseName: string) => { folderId: string; name: string; created: boolean } | null;
  moveGame: (id: string, folderId: string | null, beforeId: string | null) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
};

export const emptyDraft = (): Draft => ({
  title: "",
  exePath: "",
  workingDir: "",
  args: "",
  tags: "",
  folderId: null,
  note: "",
  cover: null,
});

export function sessionSeconds(startedAt: number, endedAt: number): number {
  if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt) || endedAt < startedAt) return 0;
  return Math.floor((endedAt - startedAt) / 1000);
}

export function formatExact(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${h}:${pad(m)}:${pad(s)}`;
}

export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,;]/)) {
    const tag = part.trim().slice(0, 32);
    if (!tag) continue;
    const key = tagKey(tag);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length === 12) break;
  }
  return out;
}

export function tagKey(name: string): string {
  return name.trim().toLocaleLowerCase();
}

export function tagsToField(tags: string[]): string {
  return tags.join(", ");
}

export function draftFromGame(game: Game): Draft {
  return {
    title: game.title,
    exePath: game.exePath,
    workingDir: game.workingDir,
    args: game.args,
    tags: tagsToField(game.tags),
    folderId: game.folderId,
    note: game.note,
    cover: game.cover,
  };
}

export function tagColor(book: ShelfTag[], name: string): string {
  const found = book.find((tag) => tagKey(tag.name) === tagKey(name));
  return found?.color ?? TAG_COLORS[0];
}

const SAMPLE_KEYS = new Set([
  "harbor light\0c:\\games\\harborlight\\harborlight.exe",
  "amber route\0d:\\portable\\amberroute\\amber.exe",
  "northwind\0c:\\games\\northwind\\northwind.exe",
  "glass saint\0",
  "low tide\0c:\\games\\lowtide\\tide.exe",
  "marble year\0",
]);

const SAMPLE_TAGS = new Set([
  "диск",
  "portable",
  "старое",
  "disc",
  "older",
  "portabel",
  "älter",
  "disco",
  "portatile",
  "vecchio",
  "portátil",
  "antiguo",
  "디스크",
  "포터블",
  "오래된",
  "ディスク",
  "ポータブル",
  "古い",
  "光盘",
  "便携",
  "旧的",
]);

function isSampleGame(game: { title?: string; exePath?: string }): boolean {
  const title = (game.title ?? "").trim().toLocaleLowerCase();
  const exe = (game.exePath ?? "").trim().toLocaleLowerCase().replaceAll("/", "\\");
  return SAMPLE_KEYS.has(`${title}\0${exe}`);
}

function withoutSamples(games: Game[], tagbook: ShelfTag[], folders: ShelfFolder[]) {
  const nextGames = games.filter((game) => !isSampleGame(game));
  if (nextGames.length === games.length) return { games, tagbook, folders };
  if (nextGames.length === 0) return { games: [], tagbook: [], folders: [] };
  const used = new Set(nextGames.flatMap((game) => game.tags.map((tag) => tagKey(tag))));
  return {
    games: nextGames,
    tagbook: tagbook.filter((tag) => used.has(tagKey(tag.name)) || !SAMPLE_TAGS.has(tag.name.trim().toLocaleLowerCase())),
    folders: folders.filter((folder) => nextGames.some((game) => game.folderId === folder.id)),
  };
}

function mergeBook(book: ShelfTag[], names: string[]): ShelfTag[] {
  const next = [...book];
  for (const name of names) {
    if (!next.some((tag) => tagKey(tag.name) === tagKey(name))) {
      next.push({ name, color: TAG_COLORS[next.length % TAG_COLORS.length] });
    }
  }
  return next;
}

function normalizeGame(value: unknown): Game | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<Game>;
  if (typeof raw.id !== "string" || !raw.id) return null;
  if (typeof raw.title !== "string" || !raw.title.trim()) return null;
  const now = new Date().toISOString();
  return {
    id: raw.id,
    title: raw.title.trim().slice(0, 200),
    exePath: typeof raw.exePath === "string" ? raw.exePath : "",
    workingDir: typeof raw.workingDir === "string" ? raw.workingDir : "",
    args: typeof raw.args === "string" ? raw.args : "",
    cover: typeof raw.cover === "string" && raw.cover.startsWith("data:image/") ? raw.cover : null,
    tags: Array.isArray(raw.tags) ? parseTags(raw.tags.filter((tag) => typeof tag === "string").join(",")) : [],
    folderId: typeof raw.folderId === "string" && raw.folderId ? raw.folderId : null,
    note: typeof raw.note === "string" ? raw.note.slice(0, 2000) : "",
    playSeconds: typeof raw.playSeconds === "number" && raw.playSeconds > 0 ? Math.floor(raw.playSeconds) : 0,
    lastPlayedAt: typeof raw.lastPlayedAt === "string" ? raw.lastPlayedAt : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
  };
}

function normalizeFolder(value: unknown): ShelfFolder | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<ShelfFolder>;
  if (typeof raw.id !== "string" || !raw.id) return null;
  if (typeof raw.name !== "string" || !raw.name.trim()) return null;
  return { id: raw.id, name: raw.name.trim().slice(0, 48) };
}

export function parseLibraryFile(text: string): { games: Game[]; tagbook: ShelfTag[]; folders: ShelfFolder[] } | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  const list = Array.isArray(data) ? data : data && typeof data === "object" && Array.isArray((data as { games?: unknown }).games) ? (data as { games: unknown[] }).games : null;
  if (!list) return null;
  const games = list.map(normalizeGame).filter((game): game is Game => game !== null);
  if (!games.length) return null;
  const rawBook = data && typeof data === "object" && Array.isArray((data as { tagbook?: unknown }).tagbook) ? (data as { tagbook: unknown[] }).tagbook : [];
  const tagbook = mergeBook(
    rawBook
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const tag = item as Partial<ShelfTag>;
        if (typeof tag.name !== "string" || !tag.name.trim()) return null;
        const color = typeof tag.color === "string" && TAG_COLORS.includes(tag.color as (typeof TAG_COLORS)[number]) ? tag.color : TAG_COLORS[0];
        return { name: tag.name.trim().slice(0, 32), color };
      })
      .filter((tag): tag is ShelfTag => tag !== null),
    games.flatMap((game) => game.tags),
  );
  const rawFolders = data && typeof data === "object" && Array.isArray((data as { folders?: unknown }).folders) ? (data as { folders: unknown[] }).folders : [];
  const folders = rawFolders.map(normalizeFolder).filter((folder): folder is ShelfFolder => folder !== null);
  const ids = new Set(folders.map((folder) => folder.id));
  return { games: games.map((game) => ({ ...game, folderId: game.folderId && ids.has(game.folderId) ? game.folderId : null })), tagbook, folders };
}

function closePrevious(games: Game[], previous: Session, endedAt: number): Game[] {
  if (!previous.counting) return games;
  const elapsed = sessionSeconds(previous.startedAt, endedAt);
  const now = new Date(endedAt).toISOString();
  return games.map((item) =>
    item.id === previous.gameId ? { ...item, playSeconds: item.playSeconds + elapsed, lastPlayedAt: now, updatedAt: now } : item,
  );
}

export type Medal = { id: MedalId; mark: string; earned: boolean };

export function collectMedals(games: Game[], tagbook: ShelfTag[]): Medal[] {
  const totalSeconds = games.reduce((sum, game) => sum + game.playSeconds, 0);
  const played = games.filter((game) => game.lastPlayedAt).length;
  const withCover = games.some((game) => game.cover);
  const withNote = games.some((game) => game.note.trim());
  const shelved = games.some((game) => !game.exePath && game.note.trim());
  return [
    { id: "first", mark: "I", earned: games.length >= 1 },
    { id: "five", mark: "V", earned: games.length >= 5 },
    { id: "ten", mark: "X", earned: games.length >= 10 },
    { id: "hour", mark: "1", earned: totalSeconds >= 3600 },
    { id: "ten-hours", mark: "10", earned: totalSeconds >= 36000 },
    { id: "day", mark: "24", earned: totalSeconds >= 86400 },
    { id: "cover", mark: "A", earned: withCover },
    { id: "note", mark: "N", earned: withNote },
    { id: "three", mark: "3", earned: played >= 3 },
    { id: "tags", mark: "T", earned: tagbook.length >= 3 },
    { id: "shelf", mark: "K", earned: shelved },
  ];
}

export const useShelf = create<LibraryState>()(
  persist(
    (set, get) => ({
      games: [],
      folders: [],
      tagbook: [],
      settings: defaultSettings(),
      didSeed: false,
      session: null,
      view: "library",
      activeTag: null,
      query: "",
      selectedId: null,
      editor: null,
      confirmDeleteId: null,
      notice: null,
      setView: (view) => set({ view, selectedId: null }),
      setActiveTag: (tag) => set({ activeTag: tag, view: "library", selectedId: null }),
      setQuery: (query) => set({ query }),
      select: (id) => set({ selectedId: id }),
      openCreate: () => set({ editor: { mode: "create" } }),
      openEdit: (id) => set({ editor: { mode: "edit", id } }),
      closeEditor: () => set({ editor: null }),
      askDelete: (id) => set({ confirmDeleteId: id }),
      clearNotice: () => set({ notice: null }),
      setSetting: (key, value) => {
        if (key === "trackTime" && value === false && get().session) get().stopSession();
        const extra = key === "medalsOn" && value === false && get().view === "medals" ? { view: "library" as const } : {};
        set({ settings: { ...get().settings, [key]: value }, ...extra });
      },
      addTag: (name, color) => {
        const clean = name.trim().slice(0, 32);
        if (!clean) return "tagName";
        if (get().tagbook.some((tag) => tagKey(tag.name) === tagKey(clean))) return "tagExists";
        const swatch = TAG_COLORS.includes(color as (typeof TAG_COLORS)[number]) ? color : TAG_COLORS[0];
        set({ tagbook: [...get().tagbook, { name: clean, color: swatch }] });
        return null;
      },
      recolorTag: (name, color) => {
        if (!TAG_COLORS.includes(color as (typeof TAG_COLORS)[number])) return;
        set({ tagbook: get().tagbook.map((tag) => (tagKey(tag.name) === tagKey(name) ? { ...tag, color } : tag)) });
      },
      deleteTag: (name) => {
        const key = tagKey(name);
        const current = get().activeTag;
        set({
          tagbook: get().tagbook.filter((tag) => tagKey(tag.name) !== key),
          games: get().games.map((game) => ({ ...game, tags: game.tags.filter((tag) => tagKey(tag) !== key) })),
          activeTag: current && tagKey(current) === key ? null : current,
        });
      },
      createFolder: (name) => {
        const clean = name.trim().slice(0, 48);
        if (!clean) return null;
        const folder = { id: crypto.randomUUID(), name: clean };
        set({ folders: [...get().folders, folder] });
        return folder.id;
      },
      renameFolder: (id, name) => {
        const clean = name.trim().slice(0, 48);
        if (!clean) return;
        set({ folders: get().folders.map((folder) => (folder.id === id ? { ...folder, name: clean } : folder)) });
      },
      deleteFolder: (id) => {
        set({
          folders: get().folders.filter((folder) => folder.id !== id),
          games: get().games.map((game) => (game.folderId === id ? { ...game, folderId: null } : game)),
        });
      },
      setGameFolder: (gameId, folderId) => {
        const next = folderId && get().folders.some((folder) => folder.id === folderId) ? folderId : null;
        set({ games: get().games.map((game) => (game.id === gameId ? { ...game, folderId: next } : game)) });
      },
      groupCards: (sourceId, targetId, baseName) => {
        if (!sourceId || sourceId === targetId) return null;
        const games = get().games;
        const source = games.find((game) => game.id === sourceId);
        const target = games.find((game) => game.id === targetId);
        if (!source || !target) return null;
        if (target.folderId && source.folderId === target.folderId) {
          set({ games: placeGame(games, sourceId, targetId, (game) => game) });
          const folder = get().folders.find((item) => item.id === target.folderId);
          return { folderId: target.folderId, name: folder?.name ?? "", created: false };
        }
        if (target.folderId) {
          const folderId = target.folderId;
          set({ games: placeGame(games, sourceId, targetId, (game) => ({ ...game, folderId })) });
          const folder = get().folders.find((item) => item.id === folderId);
          return { folderId, name: folder?.name ?? "", created: false };
        }
        const name = uniqueFolderName(get().folders, baseName);
        const folderId = crypto.randomUUID();
        const withFolder = games.map((game) => (game.id === sourceId || game.id === targetId ? { ...game, folderId } : game));
        set({
          folders: [...get().folders, { id: folderId, name }],
          games: placeGame(withFolder, sourceId, targetId, (game) => game),
        });
        return { folderId, name, created: true };
      },
      moveGame: (id, folderId, beforeId) => {
        const games = get().games;
        if (!games.some((game) => game.id === id)) return;
        const next = folderId && get().folders.some((folder) => folder.id === folderId) ? folderId : null;
        set({ games: placeGame(games, id, beforeId, (game) => ({ ...game, folderId: next })) });
      },
      saveDraft: (draft, id) => {
        const title = draft.title.trim().slice(0, 200);
        if (!title) return "needTitle";
        const now = new Date().toISOString();
        const tags = parseTags(draft.tags);
        const next: Omit<Game, "id" | "createdAt" | "playSeconds" | "lastPlayedAt"> = {
          title,
          exePath: draft.exePath.trim(),
          workingDir: draft.workingDir.trim(),
          args: draft.args,
          cover: draft.cover,
          tags,
          folderId: draft.folderId && get().folders.some((folder) => folder.id === draft.folderId) ? draft.folderId : null,
          note: draft.note.trim().slice(0, 2000),
          updatedAt: now,
        };
        const tagbook = mergeBook(get().tagbook, tags);
        if (!id) {
          const game: Game = { ...next, id: crypto.randomUUID(), createdAt: now, playSeconds: 0, lastPlayedAt: null };
          set({ games: [game, ...get().games], tagbook, editor: null, selectedId: game.id });
          return null;
        }
        set({
          tagbook,
          games: get().games.map((game) =>
            game.id === id ? { ...game, ...next, playSeconds: game.playSeconds, lastPlayedAt: game.lastPlayedAt, createdAt: game.createdAt } : game,
          ),
          editor: null,
        });
        return null;
      },
      remove: (id) => {
        const session = get().session;
        set({
          games: get().games.filter((game) => game.id !== id),
          selectedId: get().selectedId === id ? null : get().selectedId,
          confirmDeleteId: null,
          session: session?.gameId === id ? null : session,
        });
      },
      startSession: (id) => {
        const game = get().games.find((item) => item.id === id);
        if (!game?.exePath) return;
        if (!get().settings.trackTime) {
          set({ notice: { key: "timeOff" } });
          return;
        }
        const previous = get().session;
        if (previous?.gameId === id) return;
        const startedAt = Date.now();
        const games = previous ? closePrevious(get().games, previous, startedAt) : get().games;
        set({ games, session: { gameId: id, startedAt, lastBeat: startedAt, counting: true }, notice: null });
      },
      stopSession: () => {
        const session = get().session;
        if (!session) return;
        set({ session: null, games: closePrevious(get().games, session, Date.now()) });
      },
      settleInterrupted: () => {
        const session = get().session;
        if (!session) return;
        const endedAt = Math.min(Date.now(), session.lastBeat || session.startedAt);
        set({ session: null, games: closePrevious(get().games, session, endedAt) });
      },
      importGames: (games, tagbook, folders) => {
        const nextFolders = folders ?? [];
        const ids = new Set(nextFolders.map((folder) => folder.id));
        set({
          games: games.map((game) => ({ ...game, folderId: game.folderId && ids.has(game.folderId) ? game.folderId : null })),
          folders: nextFolders,
          tagbook: tagbook ?? mergeBook([], games.flatMap((game) => game.tags)),
          selectedId: null,
          editor: null,
          session: null,
          didSeed: true,
          notice: { key: "imported", count: games.length },
        });
      },
      seedIfNeeded: () => {
        const cleaned = withoutSamples(get().games, get().tagbook, get().folders);
        if (get().didSeed && cleaned.games === get().games) {
          if (get().tagbook.length === 0) set({ tagbook: mergeBook([], get().games.flatMap((game) => game.tags)) });
          return;
        }
        set({ ...cleaned, didSeed: true, session: cleaned.games.length === 0 ? null : get().session });
      },
    }),
    {
      name: "polka.library.v2",
      storage: createJSONStorage(() => programStorage()),
      skipHydration: true,
      partialize: (state) => ({
        games: state.games,
        folders: state.folders,
        tagbook: state.tagbook,
        settings: state.settings,
        didSeed: state.didSeed,
        session: state.session,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Persisted>;
        const folders = Array.isArray(saved.folders) ? saved.folders.map(normalizeFolder).filter((folder): folder is ShelfFolder => folder !== null) : [];
        const ids = new Set(folders.map((folder) => folder.id));
        const games = Array.isArray(saved.games)
          ? saved.games.map((game) => ({
              ...game,
              folderId: game && typeof game.folderId === "string" && ids.has(game.folderId) ? game.folderId : null,
              note: game && typeof game.note === "string" ? game.note : "",
            }))
          : [];
        const cleaned = withoutSamples(games, Array.isArray(saved.tagbook) ? saved.tagbook : [], folders);
        return {
          ...current,
          games: cleaned.games,
          folders: cleaned.folders,
          tagbook: cleaned.tagbook,
          settings: { ...defaultSettings(), ...(saved.settings ?? {}) },
          didSeed: Boolean(saved.didSeed) || cleaned.games.length !== games.length,
          session:
            cleaned.games.length === 0
              ? null
              : saved.session && typeof saved.session.startedAt === "number"
                ? { ...saved.session, lastBeat: saved.session.lastBeat || saved.session.startedAt, counting: saved.session.counting !== false }
                : null,
        };
      },
    },
  ),
);

function uniqueFolderName(folders: ShelfFolder[], base: string): string {
  const clean = base.trim().slice(0, 40) || "Folder";
  const taken = new Set(folders.map((folder) => folder.name.toLocaleLowerCase()));
  if (!taken.has(clean.toLocaleLowerCase())) return clean;
  for (let n = 2; n < 100; n += 1) {
    const next = `${clean} ${n}`.slice(0, 48);
    if (!taken.has(next.toLocaleLowerCase())) return next;
  }
  return clean;
}

function placeGame(games: Game[], id: string, beforeId: string | null, patch: (game: Game) => Game): Game[] {
  const current = games.find((game) => game.id === id);
  if (!current) return games;
  const updated = patch(current);
  const rest = games.filter((game) => game.id !== id);
  if (!beforeId || beforeId === id) return [...rest, updated];
  const index = rest.findIndex((game) => game.id === beforeId);
  if (index < 0) return [...rest, updated];
  return [...rest.slice(0, index), updated, ...rest.slice(index)];
}

export function visibleGames(games: Game[], view: ShelfView, query: string, activeTag: string | null, locale: string): Game[] {
  const q = query.trim().toLocaleLowerCase(locale);
  let list = games;
  if (view === "recent") {
    list = games
      .filter((game) => game.lastPlayedAt)
      .sort((a, b) => (b.lastPlayedAt ?? "").localeCompare(a.lastPlayedAt ?? ""))
      .slice(0, 12);
  } else {
    list = [...games];
  }
  if (activeTag && (view === "library" || view === "recent")) {
    const key = tagKey(activeTag);
    list = list.filter((game) => game.tags.some((tag) => tagKey(tag) === key));
  }
  if (!q) return list;
  return list.filter((game) => game.title.toLocaleLowerCase(locale).includes(q));
}

export async function fileToCover(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 600 / bitmap.width, 900 / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("cover");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.86);
}
