import { useMemo, useState } from "react";
import { CATALOG } from "@/lib/fox/packages";
import { runCommand } from "@/lib/fox/shell";
import { useFox } from "@/lib/fox/store";

const MANAGERS = ["apt", "yum", "dnf", "rpm", "dpkg"] as const;

const CHEAT = [
  ["apt install NAME", "導入"],
  ["apt remove NAME", "削除"],
  ["apt search WORD", "検索"],
  ["yum install NAME", "yum 導入"],
  ["dnf upgrade NAME", "dnf 更新"],
  ["rpm -qa", "rpm 一覧"],
  ["rpm -ivh FILE.rpm", "rpm 導入"],
  ["dpkg -i FILE.deb", "deb 導入"],
  ["dpkg -l", "deb 一覧"],
];

function command(manager: (typeof MANAGERS)[number], action: "install" | "remove" | "list", name: string) {
  if (action === "list") {
    if (manager === "rpm") return "rpm -qa";
    if (manager === "dpkg") return "dpkg -l";
    if (manager === "yum" || manager === "dnf") return `${manager} list installed`;
    return "apt list";
  }
  if (action === "remove") {
    if (manager === "rpm") return `rpm -e ${name}`;
    if (manager === "dpkg") return `dpkg -r ${name}`;
    return `${manager} remove ${name}`;
  }
  if (manager === "rpm") return `rpm -ivh ${name}.rpm`;
  if (manager === "dpkg") return `dpkg -i ${name}.deb`;
  return `${manager} install ${name}`;
}

export function PkgWindow() {
  const packages = useFox((s) => s.packages);
  const [manager, setManager] = useState<(typeof MANAGERS)[number]>("apt");
  const [query, setQuery] = useState("");
  const [log, setLog] = useState("apt / yum / dnf / rpm / dpkg はワークスペース内の模擬です。");

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(CATALOG).filter(([name, pkg]) => !q || name.includes(q) || pkg.desc.includes(q));
  }, [query]);

  const run = (cmd: string) => {
    const state = useFox.getState();
    const result = runCommand(cmd, state, true);
    useFox.setState({
      ...(result.patch ?? {}),
      lines: [...state.lines, { kind: "cmd" as const, text: `${state.promptName}:${state.cwd}$ ${cmd}` }, ...result.lines].slice(-240),
    });
    setLog(result.lines.map((line) => line.text).join("\n") || cmd);
  };

  return (
    <div className="fox-pkg">
      <header>
        <b>パッケージ</b>
        <div>
          {MANAGERS.map((item) => (
            <button key={item} type="button" className={item === manager ? "is-on" : ""} onClick={() => setManager(item)}>
              {item}
            </button>
          ))}
        </div>
      </header>
      <input value={query} aria-label="パッケージ検索" placeholder="名前か説明で検索" onChange={(event) => setQuery(event.target.value)} />
      <div className="fox-pkg-grid">
        <ul>
          {hits.map(([name, pkg]) => {
            const on = Boolean(packages?.[name]);
            return (
              <li key={name}>
                <strong>{name}</strong>
                <span>{pkg.ver}</span>
                <small>{pkg.desc}</small>
                <button type="button" onClick={() => run(command(manager, on ? "remove" : "install", name))}>
                  {on ? "削除" : "導入"}
                </button>
              </li>
            );
          })}
        </ul>
        <aside>
          <p>導入済み {Object.keys(packages ?? {}).length}</p>
          <button type="button" onClick={() => run(command(manager, "list", ""))}>
            {manager} 一覧
          </button>
          <button type="button" onClick={() => run("apt update")}>
            apt update
          </button>
          {CHEAT.map(([cmd, label]) => (
            <button
              key={cmd}
              type="button"
              onClick={() => {
                if (/NAME|WORD|FILE/.test(cmd)) {
                  setLog(`${cmd}\n左の一覧からパッケージを選ぶと、この形式で実行します。`);
                  return;
                }
                run(cmd);
              }}
            >
              {label}
              <small>{cmd}</small>
            </button>
          ))}
        </aside>
      </div>
      <pre>{log}</pre>
    </div>
  );
}
