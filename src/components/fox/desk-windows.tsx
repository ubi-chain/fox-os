import type { PointerEvent } from "react";
import { useState } from "react";
import { snapFrame, stageSize, type SnapMode } from "@/lib/fox/snap";
import { useFox, type DeskWindow } from "@/lib/fox/store";
import { AiPanel } from "./ai-panel";
import { BrowserWindow } from "./browser-window";
import { BlocksWindow } from "./blocks-window";
import { DictWindow } from "./dict-window";
import { PkgWindow } from "./pkg-window";
import { GuardSite, SkyWindow } from "./sky-window";
import { ExplorerWindow } from "./explorer-window";
import { QdevPanel } from "./qdev-panel";
import { SlackPanel } from "./slack-panel";
import { SysPanel } from "./sys-panel";
import { TerminalPanel } from "./terminal-panel";

const EDGES = ["n", "s", "e", "w", "nw", "ne", "sw", "se"] as const;

function body(kind: DeskWindow["kind"]) {
  if (kind === "term") return <TerminalPanel />;
  if (kind === "dev") return <QdevPanel />;
  if (kind === "ai") return <AiPanel />;
  if (kind === "sys") return <SysPanel />;
  if (kind === "browser") return <BrowserWindow />;
  if (kind === "explorer") return <ExplorerWindow />;
  if (kind === "dict") return <DictWindow />;
  if (kind === "pkg") return <PkgWindow />;
  if (kind === "blocks") return <BlocksWindow />;
  if (kind === "sky") return <SkyWindow />;
  if (kind === "guard") return <GuardSite />;
  return <SlackPanel embedded />;
}

function hitSnap(x: number, y: number, w: number): SnapMode {
  const { width, height } = stageSize();
  const edge = 28;
  const nearLeft = x <= edge;
  const nearRight = x + w >= width - edge && x > width * 0.35;
  const nearTop = y <= 12;
  const nearBottom = y + 80 >= height - edge;
  if (nearLeft && nearTop) return "tl";
  if (nearRight && nearTop) return "tr";
  if (nearLeft && nearBottom) return "bl";
  if (nearRight && nearBottom) return "br";
  if (nearLeft) return "left";
  if (nearRight) return "right";
  if (nearTop) return "max";
  return "free";
}

export function DeskWindows() {
  const windows = useFox((s) => s.windows);
  const focusWindow = useFox((s) => s.focusWindow);
  const closeWindow = useFox((s) => s.closeWindow);
  const moveWindow = useFox((s) => s.moveWindow);
  const placeWindow = useFox((s) => s.placeWindow);
  const setAssist = useFox((s) => s.setAssist);
  const toggleMin = useFox((s) => s.toggleMin);
  const toggleMax = useFox((s) => s.toggleMax);
  const togglePin = useFox((s) => s.togglePin);
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
    let anchorX = originX;
    let anchorY = originY;
    let startX = win.x;
    let startY = win.y;
    let moved = false;
    const move = (next: globalThis.PointerEvent) => {
      if (!moved && Math.hypot(next.clientX - originX, next.clientY - originY) < 4) return;
      if (!moved && (win.max || win.snap !== "free")) {
        const back = win.prev ?? { x: 80, y: 24, w: 560, h: 420 };
        const stage = document.querySelector(".fox-stage")?.getBoundingClientRect();
        startX = Math.max(0, next.clientX - (stage?.left ?? 0) - back.w / 3);
        startY = Math.max(0, next.clientY - (stage?.top ?? 0) - 18);
        placeWindow(win.id, startX, startY, back.w, back.h, "free");
        anchorX = next.clientX;
        anchorY = next.clientY;
        moved = true;
        return;
      }
      moved = true;
      moveWindow(win.id, startX + next.clientX - anchorX, startY + next.clientY - anchorY);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!moved) return;
      const latest = useFox.getState().windows.find((item) => item.id === win.id);
      if (!latest) return;
      const mode = hitSnap(latest.x, latest.y, latest.w);
      if (mode === "free") {
        setAssist(null);
        return;
      }
      const { width, height } = stageSize();
      const frame = snapFrame(width, height, mode);
      placeWindow(win.id, frame.x, frame.y, frame.w, frame.h, mode);
      if (mode === "left" || mode === "right") setAssist({ id: win.id, side: mode });
      else setAssist(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const resize = (event: PointerEvent, win: DeskWindow, edge: (typeof EDGES)[number]) => {
    event.stopPropagation();
    event.preventDefault();
    focusWindow(win.id);
    const originX = event.clientX;
    const originY = event.clientY;
    const box = { x: win.x, y: win.y, w: win.w, h: win.h };
    const move = (next: globalThis.PointerEvent) => {
      const dx = next.clientX - originX;
      const dy = next.clientY - originY;
      let { x, y, w, h } = box;
      if (edge.includes("e")) w = box.w + dx;
      if (edge.includes("s")) h = box.h + dy;
      if (edge.includes("w")) {
        w = box.w - dx;
        x = box.x + dx;
      }
      if (edge.includes("n")) {
        h = box.h - dy;
        y = box.y + dy;
      }
      if (w < 220) {
        if (edge.includes("w")) x = box.x + box.w - 220;
        w = 220;
      }
      if (h < 160) {
        if (edge.includes("n")) y = box.y + box.h - 160;
        h = 160;
      }
      placeWindow(win.id, x, y, w, h, "free");
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <>
      {windows.map((win) =>
        win.min ? null : (
          <section
            key={win.id}
            className={closing[win.id] ? "fox-window is-line-out" : "fox-window is-line-in"}
            style={{ left: win.x, top: win.y, zIndex: win.z, width: win.w, height: win.h }}
            onPointerDown={() => focusWindow(win.id)}
          >
            <header
              className="fox-panel-h"
              onPointerDown={(event) => drag(event, win)}
              onDoubleClick={() => toggleMax(win.id)}
            >
              <span>{win.title}</span>
              <span className="fox-win-ctl">
                <button type="button" aria-label="最前面" aria-pressed={win.pinned} onClick={() => togglePin(win.id)}>
                  {win.pinned ? "▲" : "△"}
                </button>
                <button type="button" aria-label="最小化" onClick={() => toggleMin(win.id)}>
                  −
                </button>
                <button type="button" aria-label={win.max ? "元に戻す" : "最大化"} onClick={() => toggleMax(win.id)}>
                  {win.max ? "❐" : "□"}
                </button>
                <button type="button" className="is-close" aria-label="閉じる" onClick={() => requestClose(win.id)}>
                  ×
                </button>
              </span>
            </header>
            <div className="fox-window-body">{body(win.kind)}</div>
            {win.max
              ? null
              : EDGES.map((edge) => (
                  <span
                    key={edge}
                    className={`fox-edge fox-edge-${edge}`}
                    onPointerDown={(event) => resize(event, win, edge)}
                  />
                ))}
          </section>
        ),
      )}
    </>
  );
}
