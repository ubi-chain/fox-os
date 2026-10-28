import type { Line } from "./model";

export type Pkg = { ver: string; desc: string; deps: string[] };

export const CATALOG: Record<string, Pkg> = {
  git: { ver: "2.43.0", desc: "distributed version control", deps: [] },
  curl: { ver: "8.5.0", desc: "command line URL transfer", deps: [] },
  wget: { ver: "1.21.4", desc: "retrieves files from the web", deps: [] },
  vim: { ver: "9.1.0", desc: "text editor", deps: [] },
  nano: { ver: "7.2", desc: "small friendly editor", deps: [] },
  htop: { ver: "3.3.0", desc: "interactive process viewer", deps: [] },
  nginx: { ver: "1.24.0", desc: "http and reverse proxy server", deps: [] },
  python3: { ver: "3.12.3", desc: "interactive high-level language", deps: [] },
  nodejs: { ver: "22.14.0", desc: "evented I/O for V8 javascript", deps: [] },
  gcc: { ver: "13.2.0", desc: "GNU C compiler", deps: [] },
  make: { ver: "4.3", desc: "utility for directing compilation", deps: [] },
  "build-essential": { ver: "12.10", desc: "compiler toolchain meta package", deps: ["gcc", "make"] },
  "ca-certificates": { ver: "20240203", desc: "common CA certificates", deps: [] },
  bash: { ver: "5.2.21", desc: "GNU Bourne Again SHell", deps: [] },
  coreutils: { ver: "9.4", desc: "GNU core utilities", deps: [] },
  grep: { ver: "3.11", desc: "searches for a pattern", deps: [] },
  tar: { ver: "1.35", desc: "tape archiver", deps: [] },
  gzip: { ver: "1.13", desc: "compression utility", deps: [] },
  openssh: { ver: "9.6", desc: "secure shell client and server", deps: [] },
  sudo: { ver: "1.9.15", desc: "execute a command as another user", deps: [] },
  tmux: { ver: "3.4", desc: "terminal multiplexer", deps: [] },
  jq: { ver: "1.7.1", desc: "command-line JSON processor", deps: [] },
  tree: { ver: "2.1.1", desc: "displays directory tree", deps: [] },
  unzip: { ver: "6.0", desc: "extract zip archives", deps: [] },
  rsync: { ver: "3.2.7", desc: "fast incremental file transfer", deps: [] },
  docker: { ver: "26.1.0", desc: "container runtime (simulated)", deps: [] },
  postgresql: { ver: "16.2", desc: "object-relational SQL database", deps: [] },
  redis: { ver: "7.2.4", desc: "in-memory data store", deps: [] },
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

function clean(name: string): string {
  return name.replace(/\.rpm$|\.deb$/i, "").replace(/[=<>].*$/, "").toLowerCase();
}

function lookup(name: string): [string, Pkg] | null {
  const key = clean(name);
  if (CATALOG[key]) return [key, CATALOG[key]];
  const hit = Object.entries(CATALOG).find(([pkg]) => pkg.startsWith(key));
  return hit ?? null;
}

function installOne(packages: Record<string, string>, name: string, lines: Line[]) {
  const found = lookup(name);
  if (!found) {
    lines.push(err(`E: パッケージ '${name}' が見つかりません`));
    return false;
  }
  const [key, pkg] = found;
  for (const dep of pkg.deps) {
    if (!packages[dep] && CATALOG[dep]) {
      packages[dep] = CATALOG[dep].ver;
      lines.push(out(`依存: ${dep} (${CATALOG[dep].ver})`));
    }
  }
  if (packages[key]) {
    lines.push(sys(`${key} は既に入っています (${packages[key]})`));
    return true;
  }
  packages[key] = pkg.ver;
  lines.push(out(`Setting up ${key} (${pkg.ver}) ...`));
  return true;
}

function removeOne(packages: Record<string, string>, name: string, lines: Line[]) {
  const found = lookup(name);
  const key = found?.[0] ?? clean(name);
  if (!packages[key]) {
    lines.push(err(`${key} は入っていません`));
    return false;
  }
  delete packages[key];
  lines.push(out(`Removing ${key} ...`));
  return true;
}

function listInstalled(packages: Record<string, string>): string {
  const rows = Object.entries(packages).sort(([a], [b]) => a.localeCompare(b));
  if (rows.length === 0) return "(none)";
  return rows.map(([name, ver]) => `${name}  ${ver}`).join("\n");
}

export function runPackage(tokens: string[], packages: Record<string, string>): { lines: Line[]; packages?: Record<string, string> } | null {
  const cmd = tokens[0];
  if (!["apt", "apt-get", "yum", "dnf", "rpm", "dpkg"].includes(cmd)) return null;
  const next = { ...packages };
  const args = tokens.slice(1).filter((token) => !token.startsWith("-") || ["-ivh", "-Uvh", "-e", "-qa", "-qi", "-ql", "-qf", "-i", "-r", "-l", "-s", "-L"].includes(token));
  const lines: Line[] = [sys("ワークスペース内のパッケージ操作です。実機の apt/yum には出ていません。")];

  if (cmd === "apt" || cmd === "apt-get") {
    const action = args[0];
    const names = args.slice(1).filter((token) => !token.startsWith("-"));
    if (action === "update") {
      lines.push(out("Hit:1 http://archive.fox.os/ubuntu fox InRelease"));
      lines.push(out("Reading package lists... Done"));
      return { lines };
    }
    if (action === "upgrade") {
      lines.push(out("0 upgraded, 0 newly installed, 0 to remove."));
      return { lines };
    }
    if (action === "search") {
      const q = names.join(" ").toLowerCase();
      const hits = Object.entries(CATALOG).filter(([name, pkg]) => name.includes(q) || pkg.desc.includes(q));
      lines.push(out(hits.map(([name, pkg]) => `${name} - ${pkg.desc}`).join("\n") || "(no match)"));
      return { lines };
    }
    if (action === "list") {
      lines.push(out(listInstalled(next)));
      return { lines };
    }
    if (action === "install") {
      if (names.length === 0) return { lines: [err("apt install パッケージ名")] };
      for (const name of names) installOne(next, name, lines);
      return { lines, packages: next };
    }
    if (action === "remove" || action === "purge") {
      if (names.length === 0) return { lines: [err("apt remove パッケージ名")] };
      for (const name of names) removeOne(next, name, lines);
      return { lines, packages: next };
    }
    if (action === "show" || action === "info") {
      const found = names[0] ? lookup(names[0]) : null;
      if (!found) return { lines: [err("パッケージがありません")] };
      lines.push(out(`Package: ${found[0]}\nVersion: ${found[1].ver}\nDescription: ${found[1].desc}`));
      return { lines };
    }
    return { lines: [err("apt: install / remove / search / list / update / upgrade / show")] };
  }

  if (cmd === "yum" || cmd === "dnf") {
    const action = args[0];
    const names = args.slice(1).filter((token) => !token.startsWith("-"));
    if (action === "check-update" || action === "makecache") {
      lines.push(out("Last metadata expiration check: 0:00:01 ago."));
      return { lines };
    }
    if (action === "update" || action === "upgrade") {
      if (names.length === 0) {
        lines.push(out("Nothing to do."));
        return { lines };
      }
      for (const name of names) installOne(next, name, lines);
      return { lines, packages: next };
    }
    if (action === "search") {
      const q = names.join(" ").toLowerCase();
      const hits = Object.entries(CATALOG).filter(([name, pkg]) => name.includes(q) || pkg.desc.includes(q));
      lines.push(out(hits.map(([name, pkg]) => `${name}.fox  ${pkg.ver}  ${pkg.desc}`).join("\n") || "No matches found"));
      return { lines };
    }
    if (action === "list") {
      lines.push(out(listInstalled(next)));
      return { lines };
    }
    if (action === "info") {
      const found = names[0] ? lookup(names[0]) : null;
      if (!found) return { lines: [err("パッケージがありません")] };
      lines.push(out(`Name        : ${found[0]}\nVersion     : ${found[1].ver}\nSummary     : ${found[1].desc}`));
      return { lines };
    }
    if (action === "install" || action === "reinstall" || action === "localinstall") {
      if (names.length === 0) return { lines: [err(`${cmd} install パッケージ名`)] };
      for (const name of names) installOne(next, name, lines);
      lines.push(out("Complete!"));
      return { lines, packages: next };
    }
    if (action === "remove" || action === "erase") {
      if (names.length === 0) return { lines: [err(`${cmd} remove パッケージ名`)] };
      for (const name of names) removeOne(next, name, lines);
      return { lines, packages: next };
    }
    return { lines: [err(`${cmd}: install / remove / search / info / list / upgrade`)] };
  }

  if (cmd === "rpm") {
    const flag = tokens.find((token) => token.startsWith("-")) ?? "";
    const names = tokens.slice(1).filter((token) => !token.startsWith("-"));
    if (flag.includes("qa") || flag === "-qa") {
      lines.push(out(listInstalled(next)));
      return { lines };
    }
    if (flag.includes("qi")) {
      const found = names[0] ? lookup(names[0]) : null;
      if (!found) return { lines: [err("package is not installed")] };
      lines.push(out(`Name        : ${found[0]}\nVersion     : ${found[1].ver}\nSummary     : ${found[1].desc}`));
      return { lines };
    }
    if (flag.includes("ql")) {
      const key = names[0] ? clean(names[0]) : "";
      lines.push(out(`/usr/bin/${key}\n/usr/share/doc/${key}`));
      return { lines };
    }
    if (flag.includes("i") || flag.includes("U")) {
      if (names.length === 0) return { lines: [err("rpm -ivh パッケージ.rpm")] };
      for (const name of names) installOne(next, name, lines);
      return { lines, packages: next };
    }
    if (flag.includes("e")) {
      if (names.length === 0) return { lines: [err("rpm -e パッケージ名")] };
      for (const name of names) removeOne(next, name, lines);
      return { lines, packages: next };
    }
    return { lines: [err("rpm: -ivh / -Uvh / -e / -qa / -qi / -ql")] };
  }

  if (cmd === "dpkg") {
    const flag = tokens.find((token) => token.startsWith("-")) ?? "";
    const names = tokens.slice(1).filter((token) => !token.startsWith("-"));
    if (flag.includes("l") && !flag.includes("i")) {
      lines.push(out(listInstalled(next)));
      return { lines };
    }
    if (flag.includes("s") || flag.includes("L")) {
      const found = names[0] ? lookup(names[0]) : null;
      if (!found) return { lines: [err("package is not installed")] };
      lines.push(out(`Package: ${found[0]}\nStatus: install ok installed\nVersion: ${found[1].ver}`));
      return { lines };
    }
    if (flag.includes("i")) {
      if (names.length === 0) return { lines: [err("dpkg -i パッケージ.deb")] };
      for (const name of names) installOne(next, name, lines);
      return { lines, packages: next };
    }
    if (flag.includes("r") || flag.includes("P")) {
      if (names.length === 0) return { lines: [err("dpkg -r パッケージ名")] };
      for (const name of names) removeOne(next, name, lines);
      return { lines, packages: next };
    }
    return { lines: [err("dpkg: -i / -r / -l / -s")] };
  }

  return null;
}
