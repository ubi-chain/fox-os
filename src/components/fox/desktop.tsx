import { useEffect, useState } from "react";
import { armBootSound } from "@/lib/fox/boot-sound";
import { previewBody } from "@/lib/fox/model";
import { useFox } from "@/lib/fox/store";
import { AiPanel } from "./ai-panel";
import { BootOverlay } from "./boot-overlay";
import { FoxMark } from "./fox-mark";
import { QdevPanel } from "./qdev-panel";
import { SlackPanel } from "./slack-panel";
import { SysPanel } from "./sys-panel";
import { TerminalPanel } from "./terminal-panel";

const PANES = [
  { id: "term", label: "TERM" },
  { id: "dev", label: "DEV" },
  { id: "ai", label: "AI" },
  { id: "sys", label: "SYS" },
] as const;

const EXES = [
  { file: "hello.exe", label: "HELLO" },
  { file: "qdev.exe", label: "QDEV" },
] as const;

export function Desktop() {
  const phase = useFox((s) => s.phase);
  const pane = useFox((s) => s.pane);
  const launch = useFox((s) => s.launch);
  const submit = useFox((s) => s.submit);
  const openSlack = useFox((s) => s.openSlack);
  const termVisual = useFox((s) => s.termVisual);
  const openTerm = useFox((s) => s.openTerm);
  const closeTerm = useFox((s) => s.closeTerm);
  const replayBoot = useFox((s) => s.replayBoot);
  const previewOpen = useFox((s) => s.previewOpen);
  const closePreview = useFox((s) => s.closePreview);
  const body = useFox((s) => previewBody(s));
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("ja-JP", { hour12: false }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (phase !== "desktop" || termVisual !== "opening") return;
    const id = window.setTimeout(() => {
      if (useFox.getState().termVisual === "opening") useFox.setState({ termVisual: "open" });
    }, 700);
    return () => window.clearTimeout(id);
  }, [phase, termVisual]);

  return (
    <div className="fox-root">
      <header className="fox-top">
        <div className="fox-brand">
          <FoxMark />
          FOX OS
        </div>
        <div className="fox-meta">
          <span className="fox-link">
            <FoxMark />
            <strong>{clock}</strong>
          </span>
          <button type="button" className="fox-btn" onClick={termVisual === "closed" ? openTerm : closeTerm}>
            {termVisual === "closed" ? "ターミナル展開" : "ターミナル消去"}
          </button>
          <button
            type="button"
            className="fox-btn"
            onClick={() => {
              armBootSound();
              replayBoot();
            }}
          >
            再初期化
          </button>
        </div>
      </header>
      <div className="fox-stage">
        <nav className="fox-apps" aria-label="ソフト">
          {PANES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={pane === item.id ? "fox-app is-on" : "fox-app"}
              onClick={() => launch(item.id)}
            >
              <FoxMark />
              <span>{item.label}</span>
            </button>
          ))}
          {EXES.map((item) => (
            <button
              key={item.file}
              type="button"
              className="fox-app"
              onClick={() => {
                openTerm();
                submit(item.file);
              }}
            >
              <FoxMark />
              <span>{item.label}</span>
            </button>
          ))}
          <button type="button" className="fox-app" onClick={openSlack}>
            <FoxMark />
            <span>CHAT</span>
          </button>
        </nav>
        <TerminalPanel />
        <QdevPanel />
        <AiPanel />
        <SysPanel />
        {previewOpen ? (
          <div className="fox-browser" role="dialog" aria-label="アプリプレビュー">
            <header>
              <span>127.0.0.1:3000 — ワークスペース内プレビュー</span>
              <button type="button" className="fox-btn" onClick={closePreview}>
                閉じる
              </button>
            </header>
            <pre>{body}</pre>
          </div>
        ) : null}
      </div>
      <nav className="fox-dock" aria-label="パネル">
        {PANES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={pane === item.id ? "fox-btn fox-btn-accent" : "fox-btn"}
            onClick={() => launch(item.id)}
          >
            <FoxMark />
            {item.label}
          </button>
        ))}
        {EXES.map((item) => (
          <button
            key={item.file}
            type="button"
            className="fox-btn"
            onClick={() => {
              openTerm();
              submit(item.file);
            }}
          >
            <FoxMark />
            {item.label}
          </button>
        ))}
      </nav>
      {phase === "boot" ? <BootOverlay /> : null}
      <SlackPanel />
    </div>
  );
}
