import { useEffect, useRef } from "react";
import { KanaInput } from "./kana-input";
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
  const pulse = useFox((s) => s.pulse);
  const enterBreak = useFox((s) => s.enterBreak);
  const history = useFox((s) => s.history);
  const promptName = useFox((s) => s.promptName);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines, confirm]);

  useEffect(() => {
    if (termVisual === "open" || termVisual === "opening") inputRef.current?.focus();
  }, [termVisual, pane]);

  const hint = [...history].reverse().find((command) => draft.length > 0 && command.startsWith(draft) && command !== draft);

  return (
    <section className={`fox-panel fox-term is-${termVisual}${pane === "term" ? " is-active" : ""}${pulse === "term" ? " is-launch" : ""}`}>
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
            if (enterBreak) return;
            submit();
          }}
        >
          <span>{promptName}:{cwd}$</span>
          {enterBreak ? (
            <textarea
              value={draft}
              aria-label="コマンド"
              rows={3}
              spellCheck={false}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  submit();
                }
              }}
            />
          ) : (
            <KanaInput
              ref={inputRef}
              value={draft}
              onValue={setDraft}
              aria-label="コマンド"
              spellCheck={false}
              autoCapitalize="off"
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  historyNav(-1);
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  historyNav(1);
                }
                if (event.key === "Tab" && hint) {
                  event.preventDefault();
                  setDraft(hint);
                }
              }}
            />
          )}
          {hint ? <em className="fox-hint">Tab {hint}</em> : null}
        </form>
      </div>
    </section>
  );
}
