import { useState } from "react";
import { planBuild, type BuildPlan } from "@/lib/fox/copilot";
import { serverLabel, useFox } from "@/lib/fox/store";
import { KanaInput } from "./kana-input";

function folderEntries(files: Record<string, string>, dir: string) {
  const prefix = `${dir}/`;
  const names = new Map<string, "dir" | "file">();
  for (const path of Object.keys(files)) {
    if (!path.startsWith(prefix)) continue;
    const rest = path.slice(prefix.length);
    const [head, ...more] = rest.split("/");
    if (!head || head === ".keep") continue;
    const kind = more.length > 0 ? "dir" : "file";
    const prev = names.get(head);
    names.set(head, prev === "dir" || kind === "dir" ? "dir" : "file");
  }
  return [...names.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function QdevPanel() {
  const branch = useFox((s) => s.branch);
  const dirty = useFox((s) => s.dirty);
  const project = useFox((s) => s.project);
  const server = useFox((s) => s.server);
  const db = useFox((s) => s.db);
  const tests = useFox((s) => s.tests);
  const testDetail = useFox((s) => s.testDetail);
  const notice = useFox((s) => s.notice);
  const pane = useFox((s) => s.pane);
  const pulse = useFox((s) => s.pulse);
  const submit = useFox((s) => s.submit);
  const openTerm = useFox((s) => s.openTerm);
  const openPreview = useFox((s) => s.openPreview);
  const files = useFox((s) => s.files);
  const packages = useFox((s) => s.packages);
  const applyFiles = useFox((s) => s.applyFiles);
  const [folder, setFolder] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [idea, setIdea] = useState("投稿 タイトル 本文");
  const [plan, setPlan] = useState<BuildPlan | null>(null);

  const run = (command: string) => {
    openTerm();
    submit(command);
  };

  const root = project ?? "/home/fox/sample_app";
  const here = folder ?? root;
  const entries = folderEntries(files, here);

  const askCopilot = async (prompt: string) => {
    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("status");
      setPlan((await response.json()) as BuildPlan);
    } catch {
      setPlan(planBuild(prompt, root));
    }
  };

  return (
    <section className={`fox-panel fox-qdev${pane === "dev" ? " is-active" : ""}${pulse === "dev" ? " is-launch" : ""}`}>
      <header className="fox-panel-h">
        <span>Q-DEV</span>
        <span>PKG</span>
      </header>
      <div className="fox-panel-b">
        <div className="fox-kv">
          <span>Packages</span>
          <b>{Object.keys(packages ?? {}).length}</b>
        </div>
        <div className="fox-kv">
          <span>Project</span>
          <b>{project ? project.slice(project.lastIndexOf("/") + 1) : "—"}</b>
        </div>
        <div className="fox-kv">
          <span>Git</span>
          <b>
            {branch} {dirty ? "●" : "○"}
          </b>
        </div>
        <div className="fox-kv">
          <span>Server</span>
          <b className={server ? "fox-ok" : "fox-warn"}>{serverLabel(server)}</b>
        </div>
        <div className="fox-kv">
          <span>DB</span>
          <b className={db === "ready" ? "fox-ok" : "fox-warn"}>{db === "ready" ? "SQLite" : "MISSING"}</b>
        </div>
        <div className="fox-kv">
          <span>Test</span>
          <b className={tests === "passing" ? "fox-ok" : undefined}>{testDetail}</b>
        </div>
        {notice ? <p className="fox-note">{notice}</p> : null}
        <div className="fox-actions">
          <button type="button" className="fox-btn" onClick={openTerm}>
            ターミナル
          </button>
          <button type="button" className="fox-btn fox-btn-accent" onClick={() => run("cd sample_app")}>
            プロジェクトへ
          </button>
          <button type="button" className="fox-btn" onClick={() => run("apt list")}>
            パッケージ
          </button>
          <button type="button" className="fox-btn" onClick={() => run("apt update")}>
            更新確認
          </button>
          <button type="button" className="fox-btn" onClick={() => run("cat notes.txt")}>
            メモ
          </button>
          <button type="button" className="fox-btn fox-btn-accent" onClick={openPreview}>
            アプリを開く
          </button>
        </div>
        <div className="fox-tree">
          <p className="fox-note">{here}</p>
          {folder ? (
            <button
              type="button"
              onClick={() => {
                const parent = folder.slice(0, folder.lastIndexOf("/"));
                setFolder(parent === root ? null : parent);
              }}
            >
              ../
            </button>
          ) : null}
          {entries.map(([name, kind]) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                const next = `${here}/${name}`;
                if (kind === "dir") {
                  setFolder(next);
                  setReading(null);
                  return;
                }
                setReading(next);
              }}
            >
              {kind === "dir" ? `${name}/` : name}
            </button>
          ))}
          {reading ? <pre>{files[reading] || "(empty)"}</pre> : null}
        </div>
        <form
          className="fox-ai-form"
          onSubmit={(event) => {
            event.preventDefault();
            const field = event.currentTarget.querySelector("input");
            const prompt = field?.value ?? idea;
            setIdea(prompt);
            void askCopilot(prompt);
          }}
        >
          <KanaInput value={idea} aria-label="構築したいもの" onValue={setIdea} />
          <button type="submit" className="fox-btn fox-btn-accent">
            計画
          </button>
        </form>
        {plan ? (
          <div className="fox-tree">
            <p className="fox-note">{plan.summary}</p>
            <p className="fox-note">{plan.note}</p>
            {plan.files.map((file) => (
              <p key={file.path}>{file.path}</p>
            ))}
            <button type="button" className="fox-btn fox-btn-warn" onClick={() => applyFiles(plan.files)}>
              承認して書く
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
