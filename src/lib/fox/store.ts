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

type FoxStore = OsState & {
  phase: "boot" | "desktop";
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

  finishBoot: () => set({ phase: "desktop", termVisual: "opening" }),
  replayBoot: () => set({ phase: "boot", previewOpen: false }),
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
