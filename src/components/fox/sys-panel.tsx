import { useEffect, useState } from "react";
import { useFox } from "@/lib/fox/store";
import { LookPanel } from "./extra-windows";

type Telemetry = {
  cores: number;
  online: boolean;
  heap: string;
  frame: string;
};

export function SysPanel() {
  const pane = useFox((s) => s.pane);
  const pulse = useFox((s) => s.pulse);
  const setPassword = useFox((s) => s.setPassword);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [note, setNote] = useState("");
  const [telemetry, setTelemetry] = useState<Telemetry>({
    cores: 0,
    online: true,
    heap: "—",
    frame: "—",
  });

  useEffect(() => {
    let raf = 0;
    let timer = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      setTelemetry({
        cores: navigator.hardwareConcurrency || 0,
        online: navigator.onLine,
        heap: memory ? `${Math.round(memory.usedJSHeapSize / 1048576)} MB` : "非公開",
        frame: `${dt.toFixed(1)} ms`,
      });
      timer = window.setTimeout(() => {
        raf = requestAnimationFrame(tick);
      }, 1000);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section className={`fox-panel fox-sys${pane === "sys" ? " is-active" : ""}${pulse === "sys" ? " is-launch" : ""}`}>
      <header className="fox-panel-h">
        <span>SYSTEM</span>
        <span>THIS BROWSER</span>
      </header>
      <div className="fox-panel-b">
        <div className="fox-kv">
          <span>実行層</span>
          <b>ブラウザ内</b>
        </div>
        <div className="fox-kv">
          <span>回線</span>
          <b className={telemetry.online ? "fox-ok" : "fox-warn"}>{telemetry.online ? "ONLINE" : "OFFLINE"}</b>
        </div>
        <div className="fox-kv">
          <span>論理コア</span>
          <b>{telemetry.cores || "—"}</b>
        </div>
        <div className="fox-kv">
          <span>JS heap</span>
          <b>{telemetry.heap}</b>
        </div>
        <div className="fox-kv">
          <span>描画間隔</span>
          <b>{telemetry.frame}</b>
        </div>
        <p className="fox-note">CPU 使用率としては表示していません。数字はこのブラウザの実測です。</p>
        <form
          className="fox-pass"
          onSubmit={(event) => {
            event.preventDefault();
            if (next !== again) {
              setNote("確認用パスワードが違います");
              return;
            }
            const ok = setPassword(current, next);
            setNote(ok ? "パスワードを変更しました" : "今のパスワードが違うか、新しいパスワードが4文字未満です");
            if (ok) {
              setCurrent("");
              setNext("");
              setAgain("");
            }
          }}
        >
          <h2>パスワード</h2>
          <label>
            現在
            <input type="password" value={current} autoComplete="current-password" onChange={(event) => setCurrent(event.target.value)} />
          </label>
          <label>
            新しい
            <input type="password" value={next} autoComplete="new-password" onChange={(event) => setNext(event.target.value)} />
          </label>
          <label>
            確認
            <input type="password" value={again} autoComplete="new-password" onChange={(event) => setAgain(event.target.value)} />
          </label>
          <button type="submit" className="fox-btn">
            変更
          </button>
          {note ? <p className="fox-note">{note}</p> : null}
        </form>
        <LookPanel />
      </div>
    </section>
  );
}
