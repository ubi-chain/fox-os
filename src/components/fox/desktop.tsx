import { useEffect, useState } from "react";
import { armBootSound } from "@/lib/fox/boot-sound";
import { useFox, type WinKind } from "@/lib/fox/store";
import { BootOverlay } from "./boot-overlay";
import { DeskWindows } from "./desk-windows";
import { FoxMark } from "./fox-mark";
import { LoginScreen } from "./login-screen";

const ICONS: { kind: WinKind; label: string }[] = [
  { kind: "browser", label: "ブラウザ" },
  { kind: "explorer", label: "エクスプローラ" },
  { kind: "term", label: "TERM" },
  { kind: "dev", label: "DEV" },
  { kind: "ai", label: "AI" },
  { kind: "sys", label: "SYS" },
  { kind: "chat", label: "CHAT" },
];

export function Desktop() {
  const phase = useFox((s) => s.phase);
  const openWindow = useFox((s) => s.openWindow);
  const windows = useFox((s) => s.windows);
  const focusWindow = useFox((s) => s.focusWindow);
  const termVisual = useFox((s) => s.termVisual);
  const openTerm = useFox((s) => s.openTerm);
  const closeTerm = useFox((s) => s.closeTerm);
  const replayBoot = useFox((s) => s.replayBoot);
  const submit = useFox((s) => s.submit);
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
      <div className="fox-stage fox-desk">
        <nav className="fox-apps" aria-label="ソフト">
          {ICONS.map((item) => (
            <button key={item.kind} type="button" className="fox-app" onClick={() => openWindow(item.kind)}>
              <FoxMark />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            type="button"
            className="fox-app"
            onClick={() => {
              openWindow("term");
              submit("hello.exe");
            }}
          >
            <FoxMark />
            <span>HELLO</span>
          </button>
        </nav>
        {phase === "desktop" ? <DeskWindows /> : null}
      </div>
      <nav className="fox-dock" aria-label="ウィンドウ">
        {windows.map((win) => (
          <button key={win.id} type="button" className="fox-btn" onClick={() => focusWindow(win.id)}>
            {win.title}
          </button>
        ))}
      </nav>
      {phase === "boot" ? <BootOverlay /> : null}
      {phase === "login" ? <LoginScreen /> : null}
    </div>
  );
}
