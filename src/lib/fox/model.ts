export type LineKind = "out" | "err" | "sys" | "cmd";

export type Line = { kind: LineKind; text: string };

export type Pane = "term" | "dev" | "ai" | "sys";

export type TermVisual = "closed" | "opening" | "open" | "closing";

export type OsState = {
  cwd: string;
  files: Record<string, string>;
  project: string | null;
  branch: string;
  dirty: boolean;
  server: { port: number; pid: number } | null;
  db: "ready" | "missing";
  tests: "none" | "passing" | "failing";
  testDetail: string;
  log: string[];
  lang: "en" | "he" | "ja";
  packages: Record<string, string>;
};

export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  proposal?: Proposal;
  resolved?: "run" | "dismiss";
};

export type Proposal = {
  command: string;
  cwd: string;
  effect: string;
  permission: string;
  destructive: boolean;
};

export type CommandResult = {
  lines: Line[];
  clear?: boolean;
  patch?: Partial<OsState>;
  confirm?: { command: string; warning: string };
  open?: Pane;
};

export function norm(path: string): string {
  const parts: string[] = [];
  for (const seg of path.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") parts.pop();
    else parts.push(seg);
  }
  return `/${parts.join("/")}`;
}

export function joinPath(base: string, extra: string): string {
  if (extra.startsWith("/")) return norm(extra);
  return norm(`${base}/${extra}`);
}

export function parentPath(path: string): string {
  const n = norm(path);
  if (n === "/") return "/";
  const i = n.lastIndexOf("/");
  return i <= 0 ? "/" : n.slice(0, i);
}

export function baseName(path: string): string {
  const n = norm(path);
  if (n === "/") return "/";
  return n.slice(n.lastIndexOf("/") + 1);
}

export function initialOs(): OsState {
  const project = "/home/fox/sample_app";
  return {
    cwd: "/home/fox",
    project,
    branch: "main",
    dirty: false,
    server: null,
    db: "ready",
    tests: "passing",
    testDetail: "3 runs, 0 failures",
    log: ["FOX OS session start"],
    lang: "en",
    packages: {
      curl: "8.5.0",
      git: "2.43.0",
      "ca-certificates": "20240203",
      bash: "5.2.21",
      coreutils: "9.4",
    },
    files: {
      "/home/fox/README.md": "FOX OS home directory.\nこのワークスペースはブラウザ内です。\nhello.exe と qdev.exe が実行できます。\n",
      "/home/fox/hello.exe": "FOXEXE\nprint hello.exe: FOX OS workspace\n",
      "/home/fox/qdev.exe": "FOXEXE\nopen dev\nprint Q-DEV を前面に出しました\n",
      "/home/fox/sys.exe": "FOXEXE\nopen sys\nprint SYS を前面に出しました\n",
      "/home/fox/ai.exe": "FOXEXE\nopen ai\nprint AI を前面に出しました\n",
      "/home/fox/dict.exe": "FOXEXE\nopen ai\nprint 辞典を開くには dict.exe を使ってください\n",
      [`${project}/README.md`]: "FOX OS sample workspace.\n",
      [`${project}/notes.txt`]: "メモをここに書けます。\n",
    },
  };
}

export function projectFrom(cwd: string, files: Record<string, string>, explicit: string | null): string | null {
  let cursor = norm(cwd);
  while (true) {
    if (files[`${cursor}/README.md`] || files[`${cursor}/notes.txt`]) return cursor;
    if (cursor === "/") break;
    cursor = parentPath(cursor);
  }
  return explicit;
}

export function previewBody(state: OsState): string {
  if (!state.server) return "開発サーバーは停止しています。";
  if (!state.project) return "プロジェクトがありません。";
  return state.files[`${state.project}/notes.txt`] ?? "プレビューする内容がありません。";
}
