import { useState } from "react";
import { predict } from "@/lib/fox/predict";
import { QAN_PI_SEED, runQan, type QanLine } from "@/lib/fox/qan-runtime";
import { useFox } from "@/lib/fox/store";

function GhostEditor({ kind, seed }: { kind: "crypt" | "qan"; seed: string }) {
  const [code, setCode] = useState(seed);
  const hint = predict(code, kind);
  return (
    <div className="fox-ide">
      <aside>
        <p>{kind === "crypt" ? "Foxcrypt" : "Qan"}</p>
        <p>{kind === "crypt" ? "src / Fox.java" : hint.lang}</p>
      </aside>
      <div className="fox-ide-main">
        <textarea aria-label={kind === "crypt" ? "Foxcrypt" : "Qan"} value={code} onChange={(event) => setCode(event.target.value)} />
        <p className="fox-ide-line">
          <span>{code}</span>
          <span className="fox-ghost" style={{ color: hint.color }}>
            {hint.next}
          </span>
        </p>
        <p className="fox-ghost-meta">
          {hint.lang} · {hint.program}
        </p>
      </div>
    </div>
  );
}

export function CryptWindow() {
  return <GhostEditor kind="crypt" seed="public " />;
}

/** Qan with π constant + local π() — browser-only, no external credits. */
export function QanWindow() {
  const [code, setCode] = useState(QAN_PI_SEED);
  const [out, setOut] = useState<QanLine[]>([]);
  const hint = predict(code, "qan");

  const run = () => {
    const result = runQan(code);
    setOut(result.lines);
  };

  return (
    <div className="fox-ide fox-qan-pi">
      <aside>
        <p>Qan</p>
        <p>π ローカル</p>
        <p className="fox-ghost-meta">{hint.lang}</p>
        <button type="button" className="fox-btn fox-btn-accent" onClick={run}>
          実行
        </button>
      </aside>
      <div className="fox-ide-main">
        <textarea aria-label="Qan" value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} />
        <p className="fox-ghost-meta">
          {hint.program} · クレジット不要 · 机の中だけ
        </p>
        <pre className="fox-qan-out" aria-live="polite">
          {out.length === 0
            ? "実行すると結果がここに出ます。π / π(2) / print 2 * π"
            : out.map((line, i) => (
                <span key={`${line.kind}-${i}`} data-kind={line.kind}>
                  {line.kind === "err" ? "! " : line.kind === "sys" ? "# " : ""}
                  {line.text}
                  {"\n"}
                </span>
              ))}
        </pre>
      </div>
    </div>
  );
}

export function ImeWindow() {
  const mark = useFox((s) => s.typeMark);
  const setTypeOn = useFox((s) => s.setTypeOn);
  return (
    <div className="fox-extra">
      <h2>IME</h2>
      <p>開いているソフトに合わせ、次の2〜3文字と言語、プログラムを薄い色で出します。記録はこの机の中だけです。パスワード欄は取りません。外へは送りません。</p>
      <p>
        {mark.wpm} 打/分 · {mark.grammar || "—"} · {mark.lang || "—"}
      </p>
      <p className="fox-ghost-meta">
        次 {mark.next || "—"} / {mark.program || "—"}
      </p>
      <button type="button" className="fox-btn" onClick={() => setTypeOn(!mark.on)}>
        {mark.on ? "記録を止める" : "記録を始める"}
      </button>
    </div>
  );
}

export function TypeGhost() {
  const mark = useFox((s) => s.typeMark);
  const windows = useFox((s) => s.windows);
  const front = windows.filter((win) => !win.min).sort((a, b) => b.z - a.z)[0];
  if (!mark.on || !mark.next || !front) return null;
  return (
    <div className="fox-type-ghost" style={{ left: front.x + front.w / 2, top: front.y + Math.min(front.h / 2, 120), color: mark.color }}>
      <strong>{mark.next}</strong>
      <span>{mark.lang}</span>
      <span>{mark.program}</span>
    </div>
  );
}
