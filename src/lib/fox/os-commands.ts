import { joinPath, type Line } from "./model";

export type DeskKind = "term" | "dev" | "ai" | "sys" | "browser" | "explorer" | "chat" | "dict" | "pkg";

export type DeskWindowRef = { id: string; kind: DeskKind; title: string; z: number };

export type DeskContext = {
  cwd: string;
  files: Record<string, string>;
  windows: DeskWindowRef[];
  aliases: Record<string, { kind: DeskKind; title: string }>;
  sockets: { name: string; from: string; to: string }[];
  deploys: { name: string; file: string; host: string; port: string }[];
  asm: Record<string, string>;
  asmApp: string;
};

export type DeskFx =
  | { op: "lock" }
  | { op: "sleep" }
  | { op: "shutdown" }
  | { op: "open"; kind: DeskKind; title: string }
  | { op: "close"; id: string }
  | { op: "rename"; id: string; title: string }
  | { op: "catch"; ip: string }
  | { op: "stop-catch" }
  | { op: "socket"; name: string; from: string; to: string }
  | { op: "send"; name: string; ip: string; port: string }
  | { op: "asm"; app: string; text: string }
  | { op: "asm-edit"; app: string; text: string }
  | { op: "enter"; on: boolean }
  | { op: "deploy"; name: string; file: string; host: string; port: string }
  | { op: "undeploy"; name: string };

export type DeskResult = { lines: Line[]; files?: Record<string, string>; fx?: DeskFx };

const KINDS: Record<string, DeskKind> = {
  "hello.exe": "term",
  "term.exe": "term",
  "terminal.exe": "term",
  "trm.exe": "term",
  "qdev.exe": "dev",
  "dev.exe": "dev",
  "sys.exe": "sys",
  "ai.exe": "ai",
  "web.exe": "browser",
  "browser.exe": "browser",
  "exp.exe": "explorer",
  "explorer.exe": "explorer",
  "chat.exe": "chat",
  "cht.exe": "chat",
  "slack.exe": "chat",
  "dict.exe": "dict",
  "dictionary.exe": "dict",
  "jisho.exe": "dict",
  "pkg.exe": "pkg",
  "apt.exe": "pkg",
  "packages.exe": "pkg",
};

const TITLES: Record<DeskKind, string> = {
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

function out(text: string): Line {
  return { kind: "out", text };
}
function err(text: string): Line {
  return { kind: "err", text };
}
function sys(text: string): Line {
  return { kind: "sys", text };
}

function exeKey(raw: string): string {
  const name = raw.trim().replace(/^\/+/, "");
  return name.toLowerCase().endsWith(".exe") ? name : `${name}.exe`;
}

function stem(raw: string): string {
  return raw.trim().replace(/\.exe$/i, "");
}

function resolveKind(raw: string, ctx: DeskContext): { kind: DeskKind; title: string } | null {
  const key = exeKey(raw).toLowerCase();
  const alias = ctx.aliases[key] ?? ctx.aliases[exeKey(raw)];
  if (alias) return alias;
  const kind = KINDS[key];
  if (!kind) return null;
  return { kind, title: TITLES[kind] };
}

function front(ctx: DeskContext): DeskWindowRef | null {
  return ctx.windows.reduce<DeskWindowRef | null>((best, win) => (!best || win.z > best.z ? win : best), null);
}

function matchWindow(raw: string, ctx: DeskContext): DeskWindowRef | null {
  const key = exeKey(raw).toLowerCase();
  const plain = stem(raw);
  const hits = ctx.windows.filter((win) => {
    const titleKey = exeKey(win.title).toLowerCase();
    return (
      win.title === raw ||
      win.title === plain ||
      titleKey === key ||
      exeKey(TITLES[win.kind]).toLowerCase() === key ||
      `${win.kind}.exe` === key
    );
  });
  return hits.sort((a, b) => b.z - a.z)[0] ?? null;
}

function asmFor(app: string): string {
  return [
    `; FOX OS 模擬アセンブラ  ${app}`,
    "; ブラウザ内の見本です。実バイナリではありません。",
    "push ebp",
    "mov ebp, esp",
    "mov eax, 1",
    `call fox_${app.replace(/\W/g, "_")}`,
    "pop ebp",
    "ret",
  ].join("\n");
}

function splitHost(token: string): { host: string; port: string } | null {
  const slash = token.lastIndexOf("/");
  if (slash <= 0) return null;
  const host = token.slice(0, slash);
  const port = token.slice(slash + 1);
  if (!/^\d+$/.test(port)) return null;
  return { host, port };
}

export function deskCommand(input: string, ctx: DeskContext): DeskResult | null {
  const typed = input.trim();
  if (typed === "/lock") return { lines: [sys("画面をロックしました。")], fx: { op: "lock" } };
  if (typed === "/sleep") return { lines: [sys("スリープに入ります。")], fx: { op: "sleep" } };
  if (typed === "/shutdown") return { lines: [sys("シャットダウンします。")], fx: { op: "shutdown" } };
  if (typed === "/true enter") return { lines: [sys("改行入力です。Ctrl+Enter で実行します。")], fx: { op: "enter", on: true } };
  if (typed === "/false enter") return { lines: [sys("改行入力を終了しました。")], fx: { op: "enter", on: false } };

  const open = typed.match(/^\/open\s+(\S+)$/i);
  if (open) {
    const found = resolveKind(open[1], ctx);
    if (!found) return { lines: [err(`/open ${open[1]}: ソフトがありません`)] };
    return { lines: [sys(`${found.title} を開きます`)], fx: { op: "open", kind: found.kind, title: found.title } };
  }

  const close = typed.match(/^\/close\s+(\S+)$/i);
  if (close) {
    const win = matchWindow(close[1], ctx);
    if (!win) return { lines: [err(`/close ${close[1]}: 開いているソフトがありません`)] };
    return { lines: [sys(`${win.title} を閉じます`)], fx: { op: "close", id: win.id } };
  }

  const named = typed.match(/^\/name(?:\s+(\S+))?\s+to\s+(.+)$/i);
  if (named) {
    const title = named[2].trim();
    if (!title) return { lines: [err("/name to タイトル の形式です")] };
    const win = named[1] ? matchWindow(named[1], ctx) : front(ctx);
    if (!win) return { lines: [err("名前を付けるウィンドウがありません")] };
    return {
      lines: [sys(`${win.title} を ${title} に変更しました。/close ${title}.exe で閉じられます`)],
      fx: { op: "rename", id: win.id, title },
    };
  }

  const catchPacket = typed.match(/^\/catch packet of\s+(\S+)$/i);
  if (catchPacket) {
    return {
      lines: [sys(`${catchPacket[1]} のパケットログを開始しました。模擬です。実通信はしていません。`)],
      fx: { op: "catch", ip: catchPacket[1] },
    };
  }
  if (/^\/stop catch packet$/i.test(typed)) {
    return { lines: [sys("パケットログを停止しました。")], fx: { op: "stop-catch" } };
  }

  const socket = typed.match(/^\/change packet to (.+?) to (.+?) name as (\S+)$/i);
  if (socket) {
    return {
      lines: [sys(`ソケット ${socket[3]} を作りました。${socket[1]} → ${socket[2]}。送信は模擬です。`)],
      fx: { op: "socket", name: socket[3], from: socket[1], to: socket[2] },
    };
  }

  const send = typed.match(/^\/send socket\s+(\S+)\s+to\s+(\S+)(?:\s*\/\s*(\d+))?$/i);
  if (send) {
    const hostport = send[3] ? { host: send[2], port: send[3] } : splitHost(send[2]);
    if (!hostport) return { lines: [err("/send socket 名前 to IP/ポート の形式です")] };
    if (!ctx.sockets.some((item) => item.name === send[1])) return { lines: [err(`ソケット ${send[1]} はありません`)] };
    return {
      lines: [sys(`${send[1]} を ${hostport.host}:${hostport.port} へ模擬送信しました。実ソケットは開いていません。`)],
      fx: { op: "send", name: send[1], ip: hostport.host, port: hostport.port },
    };
  }

  const asm = typed.match(/^\/catch asembla by\s+(.+)$/i);
  if (asm) {
    const app = asm[1].trim();
    const text = ctx.asm[app] ?? asmFor(app);
    return { lines: [out(text), sys("模擬アセンブラです。実プロセスは読んでいません。")], fx: { op: "asm", app, text } };
  }

  const asmEdit = typed.match(/^\/change asembla to (.+?) to (.+)$/i);
  if (asmEdit) {
    const app = ctx.asmApp;
    if (!app) return { lines: [err("先に /catch asembla by ソフト名 を実行してください")] };
    const current = ctx.asm[app] ?? asmFor(app);
    if (!current.includes(asmEdit[1])) return { lines: [err(`「${asmEdit[1]}」はアセンブラにありません`)] };
    const text = current.replace(asmEdit[1], asmEdit[2]);
    return { lines: [out(text), sys("模擬アセンブラを書き換えました。")], fx: { op: "asm-edit", app, text } };
  }

  const deploy = typed.match(/^\/deploy\s+(\S+)\s+to\s+(\S+)\s+name to\s+(.+)$/i);
  if (deploy) {
    const hostport = splitHost(deploy[2]);
    if (!hostport) return { lines: [err("/deploy FILE to IP/PORT name to サーバー名 の形式です")] };
    const path = deploy[1].startsWith("/") ? deploy[1] : joinPath(ctx.cwd, deploy[1]);
    if (ctx.files[path] == null) return { lines: [err(`${deploy[1]} がありません`)] };
    const name = deploy[3].trim();
    return {
      lines: [sys(`${name} を ${hostport.host}:${hostport.port} で模擬起動しました。実ポートは開いていません。`)],
      fx: { op: "deploy", name, file: path, host: hostport.host, port: hostport.port },
    };
  }

  const stopDeploy = typed.match(/^\/stop deploy\s+(.+)$/i);
  if (stopDeploy) {
    const name = stopDeploy[1].trim();
    if (!ctx.deploys.some((item) => item.name === name)) return { lines: [err(`${name} は起動していません`)] };
    return { lines: [sys(`${name} を停止しました。`)], fx: { op: "undeploy", name } };
  }

  const download = typed.match(/^\/download\s+(\d{1,3}(?:\.\d{1,3}){3})\.([A-Za-z0-9]+)$/);
  if (download) {
    const file = `/home/fox/downloads/${download[1]}.${download[2]}`;
    return {
      lines: [sys(`${file} をワークスペースに作りました。実通信はしていません。`)],
      files: { ...ctx.files, [file]: `模擬ダウンロード ${download[1]}.${download[2]}\n実ネットワークからは取得していません。\n` },
    };
  }

  const upload = typed.match(/^\/upload to FTP\s+(\S+)\s+(\d+)\s+(\S+)\s+(\S+)$/i);
  if (upload) {
    return { lines: [sys(`FTP ${upload[3]}@${upload[1]}:${upload[2]} への模擬アップロードを記録しました。資格情報は送っていません。`)] };
  }

  const save = typed.match(/^(.*?)name to (\S+) save$/i);
  if (save && !typed.startsWith("/")) {
    const path = joinPath(ctx.cwd, save[2]);
    const body = save[1].trim();
    return {
      lines: [sys(`${path} に保存しました。`)],
      files: { ...ctx.files, [path]: body ? `${body}\n` : `saved ${new Date().toISOString()}\n` },
    };
  }

  return null;
}
