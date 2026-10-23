import { RAILS_VERSION, RUBY_VERSION } from "@/lib/fox/model";
import { serverLabel, useFox } from "@/lib/fox/store";

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

  const run = (command: string) => {
    openTerm();
    submit(command);
  };

  return (
    <section className={`fox-panel fox-qdev${pane === "dev" ? " is-active" : ""}${pulse === "dev" ? " is-launch" : ""}`}>
      <header className="fox-panel-h">
        <span>Q-DEV</span>
        <span>RAILS</span>
      </header>
      <div className="fox-panel-b">
        <div className="fox-kv">
          <span>Ruby</span>
          <b>{RUBY_VERSION}</b>
        </div>
        <div className="fox-kv">
          <span>Rails</span>
          <b>{RAILS_VERSION}</b>
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
          <button type="button" className="fox-btn" onClick={() => run("bin/rails server")}>
            サーバー起動
          </button>
          <button type="button" className="fox-btn" onClick={() => run("bin/rails server --stop")}>
            停止
          </button>
          <button type="button" className="fox-btn" onClick={() => run("bin/rails test")}>
            テスト
          </button>
          <button type="button" className="fox-btn" onClick={() => run("cat log/development.log")}>
            ログ
          </button>
          <button type="button" className="fox-btn fox-btn-accent" onClick={openPreview}>
            アプリを開く
          </button>
        </div>
      </div>
    </section>
  );
}
