import { useEffect, useRef } from "react";
import { useFox } from "@/lib/fox/store";

export function TerminalPanel() {
  const lines = useFox((s) => s.lines);
  const cwd = useFox((s) => s.cwd);
  const draft = useFox((s) => s.draft);
  const setDraft = useFox((s) => s.setDraft);
  const submit = useFox((s) => s.submit);
  const historyNav = useFox((s) => s.historyNav);
  const confirm = useFox((s) => s.confirm);
  const confirmRun = useFox((s) => s.confirmRun);
  const dismissConfirm = useFox((s) => s.dismissConfirm);
  const termVisual = useFox((s) => s.termVisual);
  const pane = useFox((s) => s.pane);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines, confirm]);

  useEffect(() => {
    if (termVisual === "open" || termVisual === "opening") inputRef.current?.focus();
  }, [termVisual, pane]);

  return (
    <section className={`fox-panel fox-term is-${termVisual}${pane === "term" ? " is-active" : ""}`}>
      <header className="fox-panel-h">
        <span>TERMINAL</span>
        <span>MATERIALIZE</span>
      </header>
      <div className="fox-term-body">
        <div className="fox-scan" />
        <div className="fox-log" role="log" aria-live="polite">
          {lines.map((line, index) => (
            <div key={`${index}-${line.text.slice(0, 12)}`} className={`fox-line-${line.kind}`}>
              {line.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        {confirm ? (
          <div className="fox-confirm">
            <p>{confirm.warning}</p>
            <p>{confirm.command}</p>
            <div className="fox-actions">
              <button type="button" className="fox-btn fox-btn-warn" onClick={confirmRun}>
                それでも実行
              </button>
              <button type="button" className="fox-btn" onClick={dismissConfirm}>
                取り消す
              </button>
            </div>
          </div>
        ) : null}
        <form
          className="fox-prompt"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <span>fox:{cwd}$</span>
          <input
            ref={inputRef}
            value={draft}
            aria-label="コマンド"
            spellCheck={false}
            autoCapitalize="off"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                historyNav(-1);
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                historyNav(1);
              }
            }}
          />
        </form>
      </div>
    </section>
  );
}
