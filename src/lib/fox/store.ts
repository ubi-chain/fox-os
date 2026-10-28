import { create } from "zustand";
import { assist } from "./assistant";
import {
  initialOs,
  previewBody,
  type ChatMessage,
  type Line,
  type OsState,
  type Pane,
  type TermVisual,
} from "./model";
import { runCommand } from "./shell";
import { deskCommand, type DeskFx } from "./os-commands";
import { ICON_SEED, settleIcon, type DeskIcon } from "./icons";
import type { SnapMode } from "./snap";

type Confirm = { command: string; warning: string };

export type WinKind = "term" | "dev" | "ai" | "sys" | "browser" | "explorer" | "chat" | "dict" | "pkg";

export type DeskWindow = {
  id: string;
  kind: WinKind;
  title: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  min: boolean;
  max: boolean;
  snap: SnapMode;
  prev: { x: number; y: number; w: number; h: number } | null;
  pinned: boolean;
};

const WIN_TITLE: Record<WinKind, string> = {
  term: "ターミナル",
  dev: "Q-DEV",
  ai: "AI",
  sys: "SYS",
  browser: "ブラウザ",
  explorer: "エクスプローラ",
  chat: "CHAT",
  dict: "辞典",
  pkg: "パッケージ",
};

type FoxStore = OsState & {
  phase: "boot" | "login" | "desktop" | "sleep" | "off";
  pane: Pane;
  termVisual: TermVisual;
  lines: Line[];
  draft: string;
  history: string[];
  histIndex: number;
  chat: ChatMessage[];
  chatDraft: string;
  confirm: Confirm | null;
  previewOpen: boolean;
  notice: string;
  pulse: Pane | null;
  slackOpen: boolean;
  slackChannel: "general" | "dev";
  slackRooms: Record<"general" | "dev", { who: string; text: string }[]>;
  slackDraft: string;
  finishBoot: () => void;
  replayBoot: () => void;
  setPane: (pane: Pane) => void;
  launch: (pane: Pane) => void;
  openTerm: () => void;
  closeTerm: () => void;
  setDraft: (draft: string) => void;
  setChatDraft: (draft: string) => void;
  submit: (raw?: string) => void;
  confirmRun: () => void;
  dismissConfirm: () => void;
  ask: () => void;
  resolveProposal: (index: number, action: "run" | "dismiss") => void;
  openPreview: () => void;
  closePreview: () => void;
  openSlack: () => void;
  closeSlack: () => void;
  setSlackChannel: (channel: "general" | "dev") => void;
  setSlackDraft: (draft: string) => void;
  sendSlack: () => void;
  applyFiles: (entries: { path: string; body: string }[]) => void;
  windows: DeskWindow[];
  nextZ: number;
  openWindow: (kind: WinKind, title?: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;
  placeWindow: (id: string, x: number, y: number, w: number, h: number, snap?: SnapMode) => void;
  toggleMin: (id: string) => void;
  toggleMax: (id: string) => void;
  showDesktop: () => void;
  togglePin: (id: string) => void;
  setAssist: (assist: { id: string; side: "left" | "right" } | null) => void;
  pushNote: (text: string) => void;
  dismissNote: (id: string) => void;
  trashPaths: (path: string) => void;
  restoreTrash: (path: string) => void;
  emptyTrash: () => void;
  makeEntry: (path: string, body: string) => void;
  icons: DeskIcon[];
  moveIcon: (id: string, col: number, row: number) => void;
  renameIcon: (id: string, label: string) => void;
  arrangeIcons: () => void;
  explorerBin: boolean;
  setExplorerBin: (open: boolean) => void;
  cascadeWindows: () => void;
  tileWindows: () => void;
  signIn: (id: string, pass: string) => boolean;
  setPassword: (current: string, next: string) => boolean;
  lock: () => void;
  sleep: () => void;
  shutdown: () => void;
  wake: () => void;
  powerOn: () => void;
  setLang: (lang: OsState["lang"]) => void;
  ime: "direct" | "hira" | "kata" | "kanji";
  imeTaps: number;
  tapIme: () => void;
  historyNav: (dir: -1 | 1) => void;
  password: string;
  sessionLocked: boolean;
  enterBreak: boolean;
  aliases: Record<string, { kind: WinKind; title: string }>;
  sockets: { name: string; from: string; to: string }[];
  deploys: { name: string; file: string; host: string; port: string }[];
  asm: Record<string, string>;
  asmApp: string;
  packetIp: string;
  trash: { path: string; body: string }[];
  notes: { id: string; text: string }[];
  assist: { id: string; side: "left" | "right" } | null;
};

const intro: Line[] = [
  { kind: "sys", text: "FOX OS workspace" },
  { kind: "sys", text: "実行層はブラウザ内です。Ubuntu カーネルではありません。" },
  { kind: "sys", text: "help でコマンド一覧。apt / yum / dnf / rpm / dpkg が使えます。" },
];

function append(lines: Line[], next: Line[]): Line[] {
  return [...lines, ...next].slice(-240);
}

let packetTimer = 0;

function stopPackets() {
  window.clearInterval(packetTimer);
  packetTimer = 0;
}

function startPackets(ip: string) {
  stopPackets();
  packetTimer = window.setInterval(() => {
    const port = [53, 80, 443, 3000][Math.floor(Math.random() * 4)];
    const size = 40 + Math.floor(Math.random() * 900);
    const line: Line = { kind: "sys", text: `packet ${ip}:${port}  ${size}B  模擬` };
    useFox.setState({ lines: append(useFox.getState().lines, [line]) });
  }, 1600);
}

function applyFx(fx: DeskFx) {
  const state = useFox.getState();
  if (fx.op === "lock") {
    useFox.setState({ phase: "login", sessionLocked: true });
    return;
  }
  if (fx.op === "sleep") {
    useFox.setState({ phase: "sleep" });
    return;
  }
  if (fx.op === "shutdown") {
    stopPackets();
    useFox.setState({ phase: "off", packetIp: "" });
    return;
  }
  if (fx.op === "open") {
    state.openWindow(fx.kind, fx.title);
    return;
  }
  if (fx.op === "close") {
    state.closeWindow(fx.id);
    return;
  }
  if (fx.op === "rename") {
    const win = state.windows.find((item) => item.id === fx.id);
    if (!win) return;
    useFox.setState({
      aliases: { ...state.aliases, [`${fx.title}.exe`.toLowerCase()]: { kind: win.kind, title: fx.title } },
      windows: state.windows.map((item) => (item.id === fx.id ? { ...item, title: fx.title } : item)),
    });
    return;
  }
  if (fx.op === "catch") {
    useFox.setState({ packetIp: fx.ip });
    startPackets(fx.ip);
    return;
  }
  if (fx.op === "stop-catch") {
    stopPackets();
    useFox.setState({ packetIp: "" });
    return;
  }
  if (fx.op === "socket") {
    useFox.setState({
      sockets: [...state.sockets.filter((item) => item.name !== fx.name), { name: fx.name, from: fx.from, to: fx.to }],
    });
    return;
  }
  if (fx.op === "asm" || fx.op === "asm-edit") {
    useFox.setState({ asm: { ...state.asm, [fx.app]: fx.text }, asmApp: fx.app });
    return;
  }
  if (fx.op === "enter") {
    useFox.setState({ enterBreak: fx.on });
    return;
  }
  if (fx.op === "deploy") {
    useFox.setState({
      deploys: [
        ...state.deploys.filter((item) => item.name !== fx.name),
        { name: fx.name, file: fx.file, host: fx.host, port: fx.port },
      ],
    });
    return;
  }
  if (fx.op === "undeploy") {
    useFox.setState({ deploys: state.deploys.filter((item) => item.name !== fx.name) });
  }
}

export const useFox = create<FoxStore>((set, get) => ({
  ...initialOs(),
  phase: "boot",
  pane: "term",
  termVisual: "closed",
  lines: intro,
  draft: "",
  history: [],
  histIndex: -1,
  chat: [
    {
      role: "assistant",
      text: "機内アシスタントです。ファイルとパッケージの質問に答えます。コマンドは承認するまで実行しません。",
    },
  ],
  chatDraft: "",
  confirm: null,
  previewOpen: false,
  notice: "",
  pulse: null,
  slackOpen: false,
  slackChannel: "general",
  slackDraft: "",
  slackRooms: {
    general: [{ who: "q", text: "この部屋はこのブラウザの中だけです。Slack には送っていません。" }],
    dev: [{ who: "q", text: "sample_app の話はこちら。" }],
  },
  windows: [],
  nextZ: 1,
  ime: "direct",
  imeTaps: 0,
  password: "admin",
  sessionLocked: false,
  enterBreak: false,
  aliases: {},
  sockets: [],
  deploys: [],
  asm: {},
  asmApp: "",
  packetIp: "",
  trash: [],
  notes: [],
  assist: null,
  icons: ICON_SEED,
  explorerBin: false,
  tapIme: () => {
    const { ime, imeTaps } = get();
    if (ime === "hira") {
      set({ ime: "kata", imeTaps: 0 });
      return;
    }
    if (ime === "kata") {
      set({ ime: "kanji", imeTaps: 0 });
      return;
    }
    if (ime === "kanji") {
      set({ ime: "direct", imeTaps: 0 });
      return;
    }
    const taps = imeTaps + 1;
    if (taps >= 3) set({ ime: "hira", imeTaps: 0 });
    else set({ imeTaps: taps });
  },

  finishBoot: () => set({ phase: "login" }),
  replayBoot: () => set({ phase: "boot", previewOpen: false, windows: [] }),
  signIn: (id, pass) => {
    if (id.trim() === "admin" && pass === get().password) {
      const locked = get().sessionLocked;
      set({ phase: "desktop", sessionLocked: false, termVisual: locked ? get().termVisual : "opening" });
      return true;
    }
    return false;
  },
  setPassword: (current, next) => {
    if (current !== get().password || next.length < 4) return false;
    set({ password: next });
    return true;
  },
  lock: () => set({ phase: "login", sessionLocked: true }),
  sleep: () => set({ phase: "sleep" }),
  shutdown: () => {
    stopPackets();
    set({ phase: "off", packetIp: "" });
  },
  wake: () => set({ phase: "desktop" }),
  powerOn: () => {
    stopPackets();
    set({ phase: "boot", previewOpen: false, windows: [], packetIp: "", sessionLocked: false });
  },
  setLang: (lang) => set({ lang }),
  setPane: (pane) => set({ pane, pulse: pane }),
  launch: (pane) => {
    const visual = get().termVisual;
    const openTerm = pane === "term" && (visual === "closed" || visual === "closing");
    set({ pane, pulse: null, termVisual: openTerm ? "opening" : visual });
    window.requestAnimationFrame(() => set({ pulse: pane }));
    if (openTerm) {
      window.setTimeout(() => {
        if (get().termVisual === "opening") set({ termVisual: "open" });
      }, 700);
    }
  },
  openTerm: () => {
    set({ termVisual: "opening", pane: "term" });
    window.setTimeout(() => {
      if (get().termVisual === "opening") set({ termVisual: "open" });
    }, 700);
  },
  closeTerm: () => {
    if (get().termVisual === "closed") return;
    set({ termVisual: "closing" });
    window.setTimeout(() => {
      if (get().termVisual === "closing") set({ termVisual: "closed" });
    }, 700);
  },
  setDraft: (draft) => set({ draft }),
  setChatDraft: (chatDraft) => set({ chatDraft }),

  submit: (raw) => {
    const input = (raw ?? get().draft).trim();
    if (!input) return;
    const state = get();
    const echo: Line = { kind: "cmd", text: `fox:${state.cwd}$ ${input}` };
    const desk = deskCommand(input, {
      cwd: state.cwd,
      files: state.files,
      windows: state.windows,
      aliases: state.aliases,
      sockets: state.sockets,
      deploys: state.deploys,
      asm: state.asm,
      asmApp: state.asmApp,
    });
    if (desk) {
      set({
        draft: "",
        history: [...state.history, input],
        histIndex: -1,
        confirm: null,
        files: desk.files ?? state.files,
        lines: append(state.lines, [echo, ...desk.lines]),
      });
      if (desk.fx) applyFx(desk.fx);
      return;
    }
    const result = runCommand(input, state);
    if (result.confirm) {
      set({
        draft: "",
        history: [...state.history, input],
        histIndex: -1,
        lines: append(state.lines, [echo, { kind: "err", text: result.confirm.warning }]),
        confirm: result.confirm,
      });
      return;
    }
    const patch = result.patch ?? {};
    const nextPane = result.open ?? state.pane;
    set({
      ...patch,
      pane: nextPane,
      pulse: null,
      draft: "",
      history: [...state.history, input],
      histIndex: -1,
      confirm: null,
      lines: result.clear ? [] : append(state.lines, [echo, ...result.lines]),
    });
    if (result.open) window.requestAnimationFrame(() => set({ pulse: result.open ?? null }));
  },

  confirmRun: () => {
    const pending = get().confirm;
    if (!pending) return;
    const state = get();
    const result = runCommand(pending.command, state, true);
    set({
      ...(result.patch ?? {}),
      confirm: null,
      lines: append(state.lines, result.lines),
    });
  },

  dismissConfirm: () => {
    const state = get();
    set({
      confirm: null,
      lines: append(state.lines, [{ kind: "sys", text: "実行を取り消しました。" }]),
    });
  },

  ask: () => {
    const text = get().chatDraft.trim();
    if (!text) return;
    const reply = assist(text, get());
    const next: ChatMessage[] = [
      ...get().chat,
      { role: "user", text },
      { role: "assistant", text: reply.text, proposal: reply.proposal },
    ];
    set({ chat: next.slice(-30), chatDraft: "" });
  },

  resolveProposal: (index, action) => {
    const chat = get().chat.map((message, i) => (i === index ? { ...message, resolved: action } : message));
    set({ chat });
    if (action === "run") {
      const command = get().chat[index]?.proposal?.command;
      if (command) get().submit(command);
    }
  },

  openPreview: () => {
    const state = get();
    if (!state.server) {
      set({
        notice: "プレビューするサーバーが止まっています。",
        pane: "dev",
      });
      return;
    }
    set({
      previewOpen: true,
      notice: "",
      log: [...state.log, `GET / -> ${previewBody(state)}`],
    });
  },

  closePreview: () => set({ previewOpen: false }),

  openSlack: () => set({ slackOpen: true }),
  closeSlack: () => set({ slackOpen: false }),
  setSlackChannel: (slackChannel) => set({ slackChannel }),
  setSlackDraft: (slackDraft) => set({ slackDraft }),
  sendSlack: () => {
    const text = get().slackDraft.trim();
    if (!text) return;
    const channel = get().slackChannel;
    const rooms = get().slackRooms;
    set({
      slackDraft: "",
      slackRooms: { ...rooms, [channel]: [...rooms[channel], { who: "fox", text }] },
    });
  },
  applyFiles: (entries) => {
    const files = { ...get().files };
    for (const entry of entries) files[entry.path] = entry.body;
    set({
      files,
      dirty: true,
      notice: `${entries.length} ファイルを書きました`,
      log: [...get().log, `copilot wrote ${entries.length} files`],
    });
  },

  openWindow: (kind, title) => {
    const count = get().windows.length;
    const z = get().nextZ + 1;
    const win: DeskWindow = {
      id: `${kind}-${Date.now()}`,
      kind,
      title: title || WIN_TITLE[kind],
      x: 92 + (count % 6) * 28,
      y: 16 + (count % 6) * 24,
      z,
      w: kind === "browser" ? 760 : kind === "dict" || kind === "pkg" || kind === "term" || kind === "dev" ? 640 : 420,
      h: kind === "browser" || kind === "dict" || kind === "pkg" ? 480 : 420,
      min: false,
      max: false,
      snap: "free",
      prev: null,
      pinned: false,
    };
    set({
      windows: [...get().windows, win],
      nextZ: z,
      slackOpen: kind === "chat" ? true : get().slackOpen,
      pane: kind === "term" || kind === "dev" || kind === "ai" || kind === "sys" ? kind : get().pane,
      termVisual: kind === "term" ? "open" : get().termVisual,
    });
  },
  closeWindow: (id) => set({ windows: get().windows.filter((win) => win.id !== id) }),
  focusWindow: (id) => {
    const z = get().nextZ + 1;
    set({
      nextZ: z,
      windows: get().windows.map((win) => {
        if (win.id === id) return { ...win, z: win.pinned ? z + 1000 : z, min: false };
        if (win.pinned) return { ...win, z: Math.max(win.z, z + 1000) };
        return win.z > z ? { ...win, z: z - 1 } : win;
      }),
    });
  },
  moveWindow: (id, x, y) =>
    set({
      windows: get().windows.map((win) =>
        win.id === id ? { ...win, x: Math.max(0, x), y: Math.max(0, y), max: false, snap: "free" } : win,
      ),
    }),
  resizeWindow: (id, w, h) =>
    set({
      windows: get().windows.map((win) =>
        win.id === id ? { ...win, w: Math.max(220, w), h: Math.max(160, h), max: false, snap: "free" } : win,
      ),
    }),
  placeWindow: (id, x, y, w, h, snap = "free") =>
    set({
      windows: get().windows.map((win) => {
        if (win.id !== id) return win;
        const remember = snap !== "free" && win.snap === "free" ? { x: win.x, y: win.y, w: win.w, h: win.h } : win.prev;
        return {
          ...win,
          x,
          y,
          w: Math.max(220, w),
          h: Math.max(160, h),
          min: false,
          max: snap === "max",
          snap,
          prev: snap === "free" ? win.prev : remember,
        };
      }),
    }),
  toggleMin: (id) =>
    set({
      windows: get().windows.map((win) => (win.id === id ? { ...win, min: !win.min } : win)),
    }),
  toggleMax: (id) => {
    const stage = document.querySelector(".fox-stage");
    const width = stage?.clientWidth ?? 960;
    const height = stage?.clientHeight ?? 640;
    set({
      windows: get().windows.map((win) => {
        if (win.id !== id) return win;
        if (win.max || win.snap !== "free") {
          const back = win.prev ?? { x: 92, y: 16, w: 560, h: 420 };
          return { ...win, ...back, min: false, max: false, snap: "free" as const, prev: null };
        }
        return {
          ...win,
          prev: { x: win.x, y: win.y, w: win.w, h: win.h },
          x: 8,
          y: 8,
          w: width - 16,
          h: height - 16,
          min: false,
          max: true,
          snap: "max" as const,
        };
      }),
    });
  },
  showDesktop: () => {
    const open = get().windows.some((win) => !win.min);
    set({ windows: get().windows.map((win) => ({ ...win, min: open })) });
  },
  moveIcon: (id, col, row) => {
    const spot = settleIcon(get().icons, id, col, row);
    set({
      icons: get().icons.map((icon) => (icon.id === id ? { ...icon, ...spot } : icon)),
    });
  },
  renameIcon: (id, label) => {
    const next = label.trim().slice(0, 16);
    if (!next) return;
    set({ icons: get().icons.map((icon) => (icon.id === id ? { ...icon, label: next } : icon)) });
  },
  arrangeIcons: () => {
    const sorted = [...get().icons].sort((a, b) => a.label.localeCompare(b.label, "ja"));
    set({
      icons: sorted.map((icon, index) => ({
        ...icon,
        col: Math.floor(index / 8),
        row: index % 8,
      })),
    });
  },
  setExplorerBin: (open) => set({ explorerBin: open }),
  cascadeWindows: () => {
    const stage = document.querySelector(".fox-stage");
    const width = stage?.clientWidth ?? 960;
    const height = stage?.clientHeight ?? 640;
    set({
      assist: null,
      windows: get().windows.map((win, index) => ({
        ...win,
        min: false,
        max: false,
        snap: "free" as const,
        prev: null,
        x: 16 + (index % 8) * 28,
        y: 12 + (index % 8) * 26,
        w: Math.min(520, Math.max(220, width - 90)),
        h: Math.min(360, Math.max(160, height - 70)),
      })),
    });
  },
  tileWindows: () => {
    const stage = document.querySelector(".fox-stage");
    const width = stage?.clientWidth ?? 960;
    const height = stage?.clientHeight ?? 640;
    const list = get().windows;
    const count = Math.max(1, list.length);
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const gap = 8;
    const w = Math.max(220, Math.floor((width - gap * (cols + 1)) / cols));
    const h = Math.max(160, Math.floor((height - gap * (rows + 1)) / rows));
    set({
      assist: null,
      windows: list.map((win, index) => ({
        ...win,
        min: false,
        max: false,
        snap: "free" as const,
        prev: null,
        x: gap + (index % cols) * (w + gap),
        y: gap + Math.floor(index / cols) * (h + gap),
        w,
        h,
      })),
    });
  },
  togglePin: (id) =>
    set({
      windows: get().windows.map((win) => (win.id === id ? { ...win, pinned: !win.pinned } : win)),
    }),
  setAssist: (assist) => set({ assist }),
  pushNote: (text) => {
    const id = `${Date.now()}`;
    set({ notes: [...get().notes, { id, text }].slice(-8) });
  },
  dismissNote: (id) => set({ notes: get().notes.filter((note) => note.id !== id) }),
  trashPaths: (path) => {
    const files = { ...get().files };
    const trash = [...get().trash];
    const keys = Object.keys(files).filter((key) => key === path || key.startsWith(`${path}/`));
    if (keys.length === 0) return;
    for (const key of keys) {
      trash.push({ path: key, body: files[key] });
      delete files[key];
    }
    set({ files, trash, dirty: true });
  },
  restoreTrash: (path) => {
    const item = get().trash.find((entry) => entry.path === path);
    if (!item) return;
    set({
      files: { ...get().files, [item.path]: item.body },
      trash: get().trash.filter((entry) => entry.path !== path),
    });
  },
  emptyTrash: () => set({ trash: [] }),
  makeEntry: (path, body) => set({ files: { ...get().files, [path]: body } }),

  historyNav: (dir) => {
    const { history, histIndex, draft } = get();
    if (history.length === 0) return;
    const start = histIndex === -1 ? history.length : histIndex;
    const next = Math.min(history.length - 1, Math.max(0, start + dir));
    set({ histIndex: next, draft: history[next] ?? draft });
  },
}));

export function serverLabel(server: OsState["server"]): string {
  return server ? `RUNNING :${server.port}` : "STOPPED";
}
