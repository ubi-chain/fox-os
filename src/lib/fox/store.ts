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

type Confirm = { command: string; warning: string };

export type WinKind = "term" | "dev" | "ai" | "sys" | "browser" | "explorer" | "chat";

export type DeskWindow = {
  id: string;
  kind: WinKind;
  title: string;
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
};

const WIN_TITLE: Record<WinKind, string> = {
  term: "ターミナル",
  dev: "Q-DEV",
  ai: "AI",
  sys: "SYS",
  browser: "ブラウザ",
  explorer: "エクスプローラ",
  chat: "CHAT",
};

type FoxStore = OsState & {
  phase: "boot" | "login" | "desktop";
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
  openWindow: (kind: WinKind) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  signIn: (id: string, pass: string) => boolean;
  setLang: (lang: OsState["lang"]) => void;
  historyNav: (dir: -1 | 1) => void;
};

const intro: Line[] = [
  { kind: "sys", text: "FOX OS workspace" },
  { kind: "sys", text: "実行層はブラウザ内です。Ubuntu カーネルではありません。" },
  { kind: "sys", text: "help でコマンド一覧。sample_app は cd sample_app にあります。" },
];

function append(lines: Line[], next: Line[]): Line[] {
  return [...lines, ...next].slice(-240);
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
      text: "機内アシスタントです。Ruby と Rails の質問に答えます。コマンドは承認するまで実行しません。外部の API には送っていません。",
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

  finishBoot: () => set({ phase: "login" }),
  replayBoot: () => set({ phase: "boot", previewOpen: false, windows: [] }),
  signIn: (id, pass) => {
    if (id.trim() === "admin" && pass === "admin") {
      set({ phase: "desktop", termVisual: "opening" });
      return true;
    }
    return false;
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
        notice: "サーバーが停止しています。先に bin/rails server を実行してください。",
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

  openWindow: (kind) => {
    const count = get().windows.length;
    const z = get().nextZ + 1;
    const win: DeskWindow = {
      id: `${kind}-${Date.now()}`,
      kind,
      title: WIN_TITLE[kind],
      x: 92 + (count % 6) * 28,
      y: 16 + (count % 6) * 24,
      z,
      w: kind === "term" || kind === "browser" || kind === "dev" ? 560 : 420,
      h: 420,
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
      windows: get().windows.map((win) => (win.id === id ? { ...win, z } : win)),
    });
  },
  moveWindow: (id, x, y) =>
    set({
      windows: get().windows.map((win) => (win.id === id ? { ...win, x: Math.max(8, x), y: Math.max(8, y) } : win)),
    }),

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
