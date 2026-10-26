import type { PointerEvent } from "react";
import { useState } from "react";
import { useFox, type DeskWindow } from "@/lib/fox/store";
import { AiPanel } from "./ai-panel";
import { BrowserWindow } from "./browser-window";
import { ExplorerWindow } from "./explorer-window";
import { QdevPanel } from "./qdev-panel";
import { SlackPanel } from "./slack-panel";
import { SysPanel } from "./sys-panel";
import { TerminalPanel } from "./terminal-panel";

function body(kind: DeskWindow["kind"]) {
  if (kind === "term") return <TerminalPanel />;
  if (kind === "dev") return <QdevPanel />;
  if (kind === "ai") return <AiPanel />;
  if (kind === "sys") return <SysPanel />;
  if (kind === "browser") return <BrowserWindow />;
  if (kind === "explorer") return <ExplorerWindow />;
  return <SlackPanel embedded />;
}

export function DeskWindows() {
  const windows = useFox((s) => s.windows);
  const focusWindow = useFox((s) => s.focusWindow);
  const closeWindow = useFox((s) => s.closeWindow);
  const moveWindow = useFox((s) => s.moveWindow);
  const [closing, setClosing] = useState<Record<string, true>>({});

  const requestClose = (id: string) => {
    if (closing[id]) return;
    setClosing((state) => ({ ...state, [id]: true }));
    window.setTimeout(() => closeWindow(id), 420);
  };

  const drag = (event: PointerEvent, win: DeskWindow) => {
    if ((event.target as HTMLElement).closest("button")) return;
    focusWindow(win.id);
    const originX = event.clientX;
    const originY = event.clientY;
    const startX = win.x;
    const startY = win.y;
    const move = (next: PointerEvent) => moveWindow(win.id, startX + next.clientX - originX, startY + next.clientY - originY);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <>
      {windows.map((win) => (
        <section
          key={win.id}
          className={closing[win.id] ? "fox-window is-line-out" : "fox-window is-line-in"}
          style={{ left: win.x, top: win.y, zIndex: win.z, width: win.w, height: win.h }}
          onPointerDown={() => focusWindow(win.id)}
        >
          <header className="fox-panel-h" onPointerDown={(event) => drag(event, win)}>
            <span>{win.title}</span>
            <button type="button" className="fox-btn" onClick={() => requestClose(win.id)}>
              閉じる
            </button>
          </header>
          <div className="fox-window-body">{body(win.kind)}</div>
        </section>
      ))}
    </>
  );
}
