import {
  BUNDLER_VERSION,
  RAILS_VERSION,
  RUBY_VERSION,
  baseName,
  joinPath,
  projectFrom,
  type CommandResult,
  type Line,
  type OsState,
} from "./model";

const HELP = [
  "FOX OS ワークスペース（ブラウザ内。Ubuntu 実機ではない）",
  "ruby -v            Ruby の固定バージョン",
  "rails -v           Rails の固定バージョン",
  "bundle -v          Bundler",
  "mise current       バージョンマネージャの表示",
  "ls  cd  pwd  cat   ファイル操作",
  "rails new NAME     プロジェクト生成",
  "bin/rails server   開発サーバー起動",
  "bin/rails server --stop",
  "bin/rails test     テスト",
  "bin/rails db:prepare",
  "git status         ブランチと変更",
  "kill PID           サーバー停止",
  "clear              画面消去",
].join("\n");

function out(text: string): Line {
  return { kind: "out", text };
}
function err(text: string): Line {
  return { kind: "err", text };
}
function sys(text: string): Line {
  return { kind: "sys", text };
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input))) tokens.push(match[1] ?? match[2] ?? match[0]);
  return tokens;
}

function destructive(command: string): string | null {
  if (/\brm\b/.test(command)) return "ファイルを削除します。元に戻せません。";
  if (/db:(drop|reset)/.test(command)) return "データベースを破棄します。";
  if (/db:rollback/.test(command)) return "直前のマイグレーションを取り消します。";
  if (/git\s+reset\s+--hard/.test(command)) return "未コミットの変更を破棄します。";
  return null;
}

function listDir(cwd: string, files: Record<string, string>): { name: string; kind: "file" | "dir" }[] {
  const names = new Map<string, "file" | "dir">();
  const prefix = cwd === "/" ? "/" : `${cwd}/`;
  for (const path of Object.keys(files)) {
    if (cwd !== "/" && !path.startsWith(prefix)) continue;
    if (cwd === "/" && !path.startsWith("/")) continue;
    const rest = cwd === "/" ? path.slice(1) : path.slice(prefix.length);
    if (!rest) continue;
    const [head, ...more] = rest.split("/");
    if (!head) continue;
    const prev = names.get(head);
    names.set(head, more.length > 0 || prev === "dir" ? "dir" : "file");
  }
  return [...names.entries()]
    .map(([name, kind]) => ({ name, kind }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function railsArgs(tokens: string[]): string[] | null {
  if (tokens[0] === "rails" || tokens[0] === "bin/rails") return tokens.slice(1);
  if (tokens[0] === "bundle" && tokens[1] === "exec" && tokens[2] === "rails") return tokens.slice(3);
  return null;
}

function scaffold(path: string): Record<string, string> {
  return {
    [`${path}/Gemfile`]: `source "https://rubygems.org"\ngem "rails", "${RAILS_VERSION}"\n`,
    [`${path}/README.md`]: `${baseName(path)}\nFOX OS workspace で生成。\n`,
    [`${path}/app/controllers/home_controller.rb`]:
      'class HomeController < ApplicationController\n  def index\n    render plain: "FOX OS"\n  end\nend\n',
    [`${path}/config/database.yml`]:
      "development:\n  adapter: sqlite3\n  database: storage/development.sqlite3\n",
    [`${path}/log/development.log`]: "Created project. Database not prepared.\n",
  };
}

function requireProject(state: OsState): string | null {
  return projectFrom(state.cwd, state.files, state.project);
}

export function runCommand(raw: string, state: OsState, confirmed = false): CommandResult {
  const input = raw.trim();
  if (!input) return { lines: [] };
  const warning = destructive(input);
  if (warning && !confirmed) return { lines: [], confirm: { command: input, warning } };

  const tokens = tokenize(input);
  const cmd = tokens[0];
  const files = { ...state.files };

  if (cmd === "help") return { lines: [out(HELP)] };
  if (cmd === "clear") return { lines: [], clear: true };
  if (cmd === "pwd") return { lines: [out(state.cwd)] };
  if (cmd === "whoami") return { lines: [out("fox")] };
  if (cmd === "date") return { lines: [out(new Date().toString())] };
  if (cmd === "uname") return { lines: [sys("FOX OS workspace / browser — not a Linux kernel")] };

  if (cmd === "echo") return { lines: [out(tokens.slice(1).join(" "))] };

  if (cmd === "ls") {
    const target = tokens[1] ? joinPath(state.cwd, tokens[1]) : state.cwd;
    const entries = listDir(target, files);
    if (entries.length === 0 && !Object.keys(files).some((p) => p === target || p.startsWith(`${target}/`))) {
      return { lines: [err(`ls: ${tokens[1] ?? target}: ありません`)] };
    }
    return { lines: [out(entries.map((e) => (e.kind === "dir" ? `${e.name}/` : e.name)).join("  ") || "(empty)")] };
  }

  if (cmd === "cd") {
    const next = tokens[1] ? joinPath(state.cwd, tokens[1]) : "/home/fox";
    const exists =
      next === "/" ||
      next === "/home" ||
      next === "/home/fox" ||
      Object.keys(files).some((p) => p === next || p.startsWith(`${next}/`));
    if (!exists) return { lines: [err(`cd: ${tokens[1]}: ありません`)] };
    return { lines: [], patch: { cwd: next } };
  }

  if (cmd === "cat") {
    if (!tokens[1]) return { lines: [err("cat: ファイル名が必要です")] };
    const path = joinPath(state.cwd, tokens[1]);
    const content = files[path];
    if (content == null) return { lines: [err(`cat: ${tokens[1]}: ありません`)] };
    return { lines: [out(content.replace(/\n$/, ""))] };
  }

  if (cmd === "rm") {
    const path = joinPath(state.cwd, tokens[1] ?? "");
    if (!tokens[1] || files[path] == null) return { lines: [err("rm: 対象がありません")] };
    delete files[path];
    return {
      lines: [sys(`${path} を削除しました`)],
      patch: { files, dirty: true, log: [...state.log, `removed ${path}`] },
    };
  }

  if (cmd === "ruby" && (tokens[1] === "-v" || tokens[1] === "--version")) {
    return { lines: [out(`ruby ${RUBY_VERSION} (mise, workspace pin)`)] };
  }
  if (cmd === "ruby" && tokens[1] === "-e") {
    const code = tokens.slice(2).join(" ");
    const prints = [...code.matchAll(/puts\s+["']([^"']*)["']/g)].map((m) => m[1]);
    return { lines: prints.length ? prints.map(out) : [sys("(出力なし) 対応しているのは puts \"...\" です")] };
  }
  if (cmd === "ruby" && tokens[1]) {
    const path = joinPath(state.cwd, tokens[1]);
    const content = files[path];
    if (content == null) return { lines: [err(`ruby: ${tokens[1]}: ありません`)] };
    const prints = [...content.matchAll(/puts\s+["']([^"']*)["']/g)].map((m) => m[1]);
    return { lines: prints.length ? prints.map(out) : [sys(`${tokens[1]} を実行しました（表示出力なし）`)] };
  }

  if (cmd === "mise") return { lines: [out(`ruby ${RUBY_VERSION}`), sys("システム Ruby は変更していません")] };

  if (cmd === "bundle" && (tokens[1] === "-v" || tokens[1] === "--version")) {
    return { lines: [out(`Bundler version ${BUNDLER_VERSION}`)] };
  }

  if (cmd === "git") {
    const project = requireProject(state);
    if (tokens[1] === "status") {
      return {
        lines: [
          out(`On branch ${state.branch}`),
          out(state.dirty ? "Changes not staged for commit" : "nothing to commit, working tree clean"),
          sys(project ? `project ${project}` : "Git リポジトリの外です"),
        ],
      };
    }
    if (tokens[1] === "branch") return { lines: [out(`* ${state.branch}`)] };
    return { lines: [err("git: status と branch に対応しています")] };
  }

  if (cmd === "kill") {
    const pid = Number(tokens[1]);
    if (!state.server || state.server.pid !== pid) return { lines: [err("kill: そのプロセスはありません")] };
    return {
      lines: [sys(`開発サーバー pid ${pid} を停止しました`)],
      patch: { server: null, log: [...state.log, "server stopped"] },
    };
  }

  const rargs = railsArgs(tokens);
  if (rargs) {
    if (rargs[0] === "-v" || rargs[0] === "--version" || rargs.length === 0) {
      return { lines: [out(`Rails ${RAILS_VERSION}`)] };
    }
    if (rargs[0] === "new") {
      const name = rargs[1];
      if (!name || name.startsWith("-")) return { lines: [err("rails new NAME の形式です")] };
      const path = joinPath(state.cwd, name);
      if (Object.keys(files).some((p) => p.startsWith(`${path}/`))) {
        return { lines: [err(`${name} は既にあります`)] };
      }
      Object.assign(files, scaffold(path));
      return {
        lines: [
          out(`create ${path}`),
          out(`Rails ${RAILS_VERSION} / SQLite をプロジェクトに固定`),
          sys("作業ディレクトリを新しいプロジェクトへ移しました"),
        ],
        patch: {
          files,
          cwd: path,
          project: path,
          dirty: false,
          server: null,
          db: "missing",
          tests: "none",
          testDetail: "未実行",
          log: [`created ${path}`],
        },
      };
    }

    const project = requireProject(state);
    if (!project) return { lines: [err("Rails プロジェクトの中で実行してください（cd sample_app）")] };

    if (rargs[0] === "server") {
      const stop = rargs.includes("--stop") || rargs[1] === "stop";
      if (stop) {
        if (!state.server) return { lines: [sys("開発サーバーは動いていません")] };
        return {
          lines: [sys(`pid ${state.server.pid} を停止しました。接続は切っています。`)],
          patch: { server: null, log: [...state.log, "server stopped"] },
        };
      }
      if (state.server) return { lines: [sys(`既に起動中です  port ${state.server.port}  pid ${state.server.pid}`)] };
      const pid = 4200 + Math.floor(Math.random() * 200);
      return {
        lines: [
          out(`=> Booting Puma`),
          out(`=> Rails ${RAILS_VERSION} application starting in development`),
          out(`* Listening on http://127.0.0.1:3000`),
          sys("これはワークスペース内のサーバー状態です。実ポートは開いていません。"),
        ],
        patch: {
          server: { port: 3000, pid },
          project,
          log: [...state.log, `Listening on 127.0.0.1:3000 pid ${pid}`],
        },
      };
    }

    if (rargs[0] === "test") {
      return {
        lines: [out("Run options: --seed 4242"), out("3 runs, 3 assertions, 0 failures, 0 errors, 0 skips")],
        patch: {
          tests: "passing",
          testDetail: "3 runs, 0 failures",
          project,
          log: [...state.log, "test suite passed"],
        },
      };
    }

    if (rargs[0] === "db:prepare" || (rargs[0] === "db:migrate" && !rargs.includes("VERSION=0"))) {
      return {
        lines: [out("== CreateHome: migrated =="), sys("SQLite をプロジェクト単位で準備しました。認証情報はファイルに書いていません。")],
        patch: {
          db: "ready",
          project,
          log: [...state.log, "db:prepare ok (sqlite)"],
        },
      };
    }

    if (rargs[0] === "db:drop" || rargs[0] === "db:reset") {
      return {
        lines: [sys("データベースを破棄しました。アプリのプレビューは空になります。")],
        patch: { db: "missing", project, log: [...state.log, "database dropped"] },
      };
    }

    if (rargs[0] === "db:rollback") {
      return {
        lines: [sys("直前のマイグレーションを取り消しました。")],
        patch: { db: "missing", dirty: true, project, log: [...state.log, "db:rollback"] },
      };
    }

    if (rargs[0] === "console") {
      return { lines: [out(`Loading development environment (Rails ${RAILS_VERSION})`), sys("対話コンソールは次の段階です。コマンドはシェルに残しています。")] };
    }

    return { lines: [err(`bin/rails ${rargs.join(" ")} はこの段階では未対応です`)] };
  }

  if (cmd === "bundle" && tokens[1] === "install") {
    const project = requireProject(state);
    if (!project || !files[`${project}/Gemfile`]) return { lines: [err("Gemfile がありません")] };
    return {
      lines: [out(`Bundle complete! rails (${RAILS_VERSION})`), sys("ワークスペース内の解決です。ネットワークへは出ていません。")],
    };
  }

  return { lines: [err(`${cmd}: コマンドが見つかりません。help を見てください。`)] };
}
