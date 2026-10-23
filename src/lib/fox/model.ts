export const RUBY_VERSION = "3.3.6";
export const RAILS_VERSION = "7.2.2";
export const BUNDLER_VERSION = "2.5.16";

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
    log: ["FOX OS session start", "sample_app: SQLite ready"],
    files: {
      "/home/fox/README.md": "FOX OS home directory.\nこのワークスペースはブラウザ内です。\n",
      [`${project}/Gemfile`]: `source "https://rubygems.org"\ngem "rails", "${RAILS_VERSION}"\n`,
      [`${project}/README.md`]: "Sample Rails app for FOX OS.\n",
      [`${project}/app/controllers/home_controller.rb`]:
        "class HomeController < ApplicationController\n  def index\n    render plain: \"FOX OS\"\n  end\nend\n",
      [`${project}/config/database.yml`]:
        "development:\n  adapter: sqlite3\n  database: storage/development.sqlite3\n",
      [`${project}/log/development.log`]:
        "Started GET \"/\" for 127.0.0.1\nCompleted 200 OK in 8ms\n",
    },
  };
}

export function projectFrom(cwd: string, files: Record<string, string>, explicit: string | null): string | null {
  let cursor = norm(cwd);
  while (true) {
    if (files[`${cursor}/Gemfile`]) return cursor;
    if (cursor === "/") break;
    cursor = parentPath(cursor);
  }
  return explicit;
}

export function previewBody(state: OsState): string {
  if (!state.server) return "開発サーバーは停止しています。";
  if (!state.project) return "プロジェクトがありません。";
  const file = state.files[`${state.project}/app/controllers/home_controller.rb`] ?? "";
  const match = file.match(/render plain:\s*"([^"]*)"/);
  return match?.[1] ?? "テンプレートの render plain が見つかりません。";
}
