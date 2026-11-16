import { create } from "zustand";
import { ICON_SEED, settleIcon, type DeskIcon } from "@/lib/fox/icons";
import type { SnapMode } from "@/lib/fox/snap";

export type WinKind =
  | "browser"
  | "explorer"
  | "term"
  | "dev"
  | "ai"
  | "sys"
  | "chat"
  | "dict"
  | "pkg"
  | "sky"
  | "guard"
  | "net"
  | "furry"
  | "inari"
  | "atlas"
  | "crypt"
  | "qan"
  | "ime"
  | "sat";

export type DeskWindow = {
  id: string;
  kind: WinKind;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
  pinned: boolean;
  snap: SnapMode;
  prev?: { x: number; y: number; w: number; h: number };
};

const TITLES: Record<WinKind, string> = {
  browser: "ブラウザ",
  explorer: "エクスプローラ",
  term: "ターミナル",
  dev: "Q-DEV",
  ai: "アシスタント",
  sys: "システム",
  chat: "チャット",
  dict: "辞典",
  pkg: "パッケージ",
  sky: "FoxSky",
  guard: "まもり",
  net: "回線",
  furry: "Furrysys",
  inari: "Inari",
  atlas: "地図",
  crypt: "Foxcrypt",
  qan: "Qan",
  ime: "IME",
  sat: "SAT",
};

const DEFAULT_FILES: Record<string, string> = {
  "/home/fox/readme.txt": "FOX OS 机の中ワークスペースです。\n",
  "/home/fox/notes.md": "# notes\n",
};

type Note = { id: string; text: string; at: number };
type SlackMsg = { who: string; text: string };

type FoxState = {
  phase: "boot" | "login" | "desktop" | "locked" | "sleep" | "off";
  sessionLocked: boolean;
  windows: DeskWindow[];
  zTop: number;
  icons: DeskIcon[];
  notes: Note[];
  assist: { id: string; side: "left" | "right" } | null;
  files: Record<string, string>;
  termVisual: "closed" | "opening" | "open";
  ime: "direct" | "hira" | "kata" | "kanji";
  imeTaps: number;
  creature: string;
  emblemOn: boolean;
  promptName: string;
  plugins: { name: string; note: string }[];
  slackOpen: boolean;
  slackChannel: "general" | "dev";
  slackRooms: Record<string, SlackMsg[]>;
  slackDraft: string;
  explorerBin: boolean;
  cwd: string;
  branch: string;
  dirty: boolean;
  project: string | null;
  packages: Record<string, string>;
  server: { pid: number } | null;
  lines: { kind: string; text: string }[];
  history: string[];
  pane: string;
  draft: string;
  chat: string[];
  chatDraft: string;
  confirm: { command: string; warning: string } | null;
  guardOn: boolean;
  skyInbox: string[];
  trash: Record<string, string>;
  trashPaths: string[];
  typeMark: boolean;
  notice: string;
  pulse: number;
  db: Record<string, unknown>;
  tests: string[];
  testDetail: string;
  enterBreak: boolean;
  historyNav: number;
  openWindow: (kind: WinKind) => void;
  focusWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  placeWindow: (id: string, x: number, y: number, w: number, h: number, snap?: SnapMode) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  toggleMin: (id: string) => void;
  toggleMax: (id: string) => void;
  togglePin: (id: string) => void;
  showDesktop: () => void;
  pushNote: (text: string) => void;
  dismissNote: (id: string) => void;
  setAssist: (v: FoxState["assist"]) => void;
  arrangeIcons: () => void;
  cascadeWindows: () => void;
  tileWindows: () => void;
  openTerm: () => void;
  closeTerm: () => void;
  replayBoot: () => void;
  submit: (cmd: string) => void;
  tapIme: () => void;
  lock: () => void;
  sleep: () => void;
  shutdown: () => void;
  wake: () => void;
  powerOn: () => void;
  noteType: (key: string, live: string | null) => void;
  moveIcon: (id: string, col: number, row: number) => void;
  renameIcon: (id: string, label: string) => void;
  setExplorerBin: (v: boolean) => void;
  setLook: (patch: Partial<{ creature: string; emblemOn: boolean; promptName: string }>) => void;
  addPlugin: (name: string, note: string) => void;
  closeSlack: () => void;
  setSlackChannel: (id: "general" | "dev") => void;
  setSlackDraft: (v: string) => void;
  sendSlack: () => void;
  makeEntry: (path: string, body: string) => void;
  signIn: (id: string, pass: string) => boolean;
  finishBoot: () => void;
  setPassword: (v: string) => void;
  applyFiles: (files: Record<string, string>) => void;
  emptyTrash: () => void;
  restoreTrash: () => void;
  setDraft: (v: string) => void;
  setChatDraft: (v: string) => void;
  ask: (q: string) => void;
  dismissConfirm: () => void;
  confirmRun: () => void;
  setTypeOn: (v: boolean) => void;
  openPreview: (path: string) => void;
  resolveProposal: (ok: boolean) => void;
};

let noteSeq = 1;
let winSeq = 1;

function nextId(prefix: string) {
  winSeq += 1;
  return `${prefix}-${winSeq}`;
}

export const useFox = create<FoxState>((set, get) => ({
  phase: "boot",
  sessionLocked: false,
  windows: [],
  zTop: 10,
  icons: ICON_SEED.map((i) => ({ ...i })),
  notes: [],
  assist: null,
  files: { ...DEFAULT_FILES },
  termVisual: "closed",
  ime: "direct",
  imeTaps: 0,
  creature: "fox",
  emblemOn: true,
  promptName: "fox",
  plugins: [],
  slackOpen: false,
  slackChannel: "general",
  slackRooms: {
    general: [
      { who: "fox", text: "FOX CHAT プレビュー — ローカルのみ" },
      { who: "sys", text: "Starlink 主経路 · FoxNet(KDDI衛星) 利用可" },
    ],
    dev: [{ who: "dev", text: "ビルドプレビュー接続" }],
  },
  slackDraft: "",
  explorerBin: false,
  cwd: "/home/fox",
  branch: "main",
  dirty: false,
  project: null,
  packages: {},
  server: null,
  lines: [{ kind: "sys", text: "FOX OS workspace ready" }],
  history: [],
  pane: "term",
  draft: "",
  chat: [],
  chatDraft: "",
  confirm: null,
  guardOn: false,
  skyInbox: [],
  trash: {},
  trashPaths: [],
  typeMark: false,
  notice: "",
  pulse: 0,
  db: {},
  tests: [],
  testDetail: "",
  enterBreak: false,
  historyNav: -1,

  openWindow: (kind) => {
    const state = get();
    const existing = state.windows.find((w) => w.kind === kind && !w.min);
    if (existing) {
      set({
        windows: state.windows.map((w) =>
          w.id === existing.id ? { ...w, z: state.zTop + 1, min: false } : w,
        ),
        zTop: state.zTop + 1,
      });
      return;
    }
    const id = nextId(kind);
    const offset = (state.windows.length % 6) * 28;
    const win: DeskWindow = {
      id,
      kind,
      title: TITLES[kind] ?? kind,
      x: 80 + offset,
      y: 40 + offset,
      w: kind === "term" ? 640 : 560,
      h: kind === "term" ? 400 : 420,
      z: state.zTop + 1,
      min: false,
      max: false,
      pinned: false,
      snap: "free",
    };
    set({
      windows: [...state.windows, win],
      zTop: state.zTop + 1,
      slackOpen: kind === "chat" ? true : state.slackOpen,
    });
  },

  focusWindow: (id) => {
    const state = get();
    set({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, z: state.zTop + 1, min: false } : w,
      ),
      zTop: state.zTop + 1,
    });
  },

  closeWindow: (id) => {
    const state = get();
    const win = state.windows.find((w) => w.id === id);
    set({
      windows: state.windows.filter((w) => w.id !== id),
      slackOpen: win?.kind === "chat" ? false : state.slackOpen,
    });
  },

  placeWindow: (id, x, y, w, h, snap = "free") => {
    set({
      windows: get().windows.map((win) =>
        win.id === id
          ? {
              ...win,
              x,
              y,
              w,
              h,
              snap,
              max: snap === "max",
              prev:
                snap !== "free" && win.snap === "free"
                  ? { x: win.x, y: win.y, w: win.w, h: win.h }
                  : win.prev,
            }
          : win,
      ),
    });
  },

  moveWindow: (id, x, y) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, x: Math.max(0, x), y: Math.max(0, y), snap: "free", max: false } : w,
      ),
    });
  },

  toggleMin: (id) => {
    set({
      windows: get().windows.map((w) => (w.id === id ? { ...w, min: !w.min } : w)),
    });
  },

  toggleMax: (id) => {
    set({
      windows: get().windows.map((w) => {
        if (w.id !== id) return w;
        if (w.max || w.snap === "max") {
          const prev = w.prev ?? { x: 80, y: 40, w: 560, h: 420 };
          return { ...w, ...prev, max: false, snap: "free" };
        }
        return {
          ...w,
          prev: { x: w.x, y: w.y, w: w.w, h: w.h },
          x: 0,
          y: 0,
          w: typeof window !== "undefined" ? window.innerWidth : 1200,
          h: typeof window !== "undefined" ? Math.max(400, window.innerHeight - 100) : 700,
          max: true,
          snap: "max",
        };
      }),
    });
  },

  togglePin: (id) => {
    set({
      windows: get().windows.map((w) => (w.id === id ? { ...w, pinned: !w.pinned } : w)),
    });
  },

  showDesktop: () => {
    set({ windows: get().windows.map((w) => ({ ...w, min: true })) });
  },

  pushNote: (text) => {
    const id = `n-${noteSeq++}`;
    set({ notes: [{ id, text, at: Date.now() }, ...get().notes].slice(0, 8) });
    window.setTimeout(() => {
      set({ notes: get().notes.filter((n) => n.id !== id) });
    }, 4200);
  },

  dismissNote: (id) => set({ notes: get().notes.filter((n) => n.id !== id) }),
  setAssist: (v) => set({ assist: v }),

  arrangeIcons: () => {
    set({
      icons: get().icons.map((icon, i) => ({
        ...icon,
        col: i % 5,
        row: Math.floor(i / 5),
      })),
    });
    get().pushNote("アイコンを整列しました");
  },

  cascadeWindows: () => {
    set({
      windows: get().windows.map((w, i) => ({
        ...w,
        x: 60 + i * 32,
        y: 36 + i * 28,
        w: 560,
        h: 400,
        min: false,
        max: false,
        snap: "free" as SnapMode,
      })),
    });
  },

  tileWindows: () => {
    const list = get().windows.filter((w) => !w.min);
    const n = Math.max(1, list.length);
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const ww = typeof window !== "undefined" ? window.innerWidth : 1200;
    const hh = typeof window !== "undefined" ? Math.max(400, window.innerHeight - 100) : 700;
    const tw = Math.floor(ww / cols);
    const th = Math.floor(hh / rows);
    set({
      windows: get().windows.map((w) => {
        if (w.min) return w;
        const idx = list.findIndex((x) => x.id === w.id);
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        return { ...w, x: c * tw, y: r * th, w: tw - 4, h: th - 4, max: false, snap: "free" as SnapMode };
      }),
    });
  },

  openTerm: () => {
    get().openWindow("term");
    set({ termVisual: "opening" });
  },

  closeTerm: () => {
    const term = get().windows.find((w) => w.kind === "term");
    if (term) get().closeWindow(term.id);
    set({ termVisual: "closed" });
  },

  replayBoot: () => {
    set({ phase: "boot", windows: [], termVisual: "closed" });
  },

  submit: (cmd) => {
    const text = cmd.trim();
    if (!text) return;
    set({
      lines: [...get().lines, { kind: "in", text }, { kind: "out", text: `ok · ${text}` }].slice(-200),
      history: [text, ...get().history].slice(0, 80),
    });
    get().pushNote(`実行: ${text}`);
  },

  tapIme: () => {
    const state = get();
    if (state.ime === "direct") {
      const taps = state.imeTaps + 1;
      if (taps >= 3) set({ ime: "hira", imeTaps: 0 });
      else set({ imeTaps: taps });
      return;
    }
    if (state.ime === "hira") set({ ime: "kata" });
    else if (state.ime === "kata") set({ ime: "kanji" });
    else set({ ime: "direct", imeTaps: 0 });
  },

  lock: () => set({ phase: "locked", sessionLocked: true }),
  sleep: () => set({ phase: "sleep" }),
  shutdown: () => set({ phase: "off", windows: [] }),
  wake: () => set({ phase: get().sessionLocked ? "locked" : "desktop" }),
  powerOn: () => set({ phase: "boot" }),
  noteType: () => {},

  moveIcon: (id, col, row) => {
    const icons = get().icons;
    const pos = settleIcon(icons, id, col, row);
    set({
      icons: icons.map((icon) => (icon.id === id ? { ...icon, col: pos.col, row: pos.row } : icon)),
    });
  },

  renameIcon: (id, label) => {
    set({
      icons: get().icons.map((icon) => (icon.id === id ? { ...icon, label: label.trim() || icon.label } : icon)),
    });
  },

  setExplorerBin: (v) => set({ explorerBin: v }),
  setLook: (patch) => set({ ...patch }),
  addPlugin: (name, note) => {
    set({ plugins: [{ name, note }, ...get().plugins].slice(0, 20) });
    get().pushNote(`プラグイン候補: ${name}`);
  },

  closeSlack: () => set({ slackOpen: false }),
  setSlackChannel: (id) => set({ slackChannel: id }),
  setSlackDraft: (v) => set({ slackDraft: v }),
  sendSlack: () => {
    const state = get();
    const text = state.slackDraft.trim();
    if (!text) return;
    const rooms = { ...state.slackRooms };
    const list = [...(rooms[state.slackChannel] ?? []), { who: "you", text }];
    rooms[state.slackChannel] = list.slice(-80);
    set({ slackRooms: rooms, slackDraft: "" });
  },

  makeEntry: (path, body) => {
    set({ files: { ...get().files, [path]: body }, dirty: true });
    get().pushNote(`保存: ${path}`);
  },

  signIn: (id, pass) => {
    const ok =
      (id === "admin" || id === "fox" || id === "") &&
      (pass === "admin" || pass === "fox" || pass === "");
    if (ok) set({ phase: "desktop", sessionLocked: false });
    return ok;
  },

  finishBoot: () => set({ phase: "login" }),
  setPassword: () => {},
  applyFiles: (files) => set({ files: { ...get().files, ...files } }),
  emptyTrash: () => set({ trash: {}, trashPaths: [] }),
  restoreTrash: () => {
    set({ files: { ...get().files, ...get().trash }, trash: {}, trashPaths: [] });
  },
  setDraft: (v) => set({ draft: v }),
  setChatDraft: (v) => set({ chatDraft: v }),
  ask: () => {},
  dismissConfirm: () => set({ confirm: null }),
  confirmRun: () => set({ confirm: null }),
  setTypeOn: (v) => set({ typeMark: v }),
  openPreview: () => {},
  resolveProposal: () => {},
}));
