import type { PointerEvent } from "react";
import { useRef, useState } from "react";
import type { DeskIcon } from "@/lib/fox/icons";
import { useFox } from "@/lib/fox/store";
import { FoxMark } from "./fox-mark";

const COL = 78;
const ROW = 72;

export function DeskIcons() {
  const icons = useFox((s) => s.icons);
  const moveIcon = useFox((s) => s.moveIcon);
  const renameIcon = useFox((s) => s.renameIcon);
  const openWindow = useFox((s) => s.openWindow);
  const submit = useFox((s) => s.submit);
  const setExplorerBin = useFox((s) => s.setExplorerBin);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [edit, setEdit] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const dragged = useRef(false);

  const open = (icon: DeskIcon) => {
    if (icon.kind === "exe") {
      openWindow("term");
      submit("hello.exe");
      return;
    }
    if (icon.kind === "bin") {
      setExplorerBin(true);
      openWindow("explorer");
      return;
    }
    setExplorerBin(false);
    openWindow(icon.kind);
  };

  const drag = (event: PointerEvent<HTMLButtonElement>, icon: DeskIcon) => {
    if (edit === icon.id) return;
    const el = event.currentTarget;
    const originX = event.clientX;
    const originY = event.clientY;
    dragged.current = false;
    const move = (next: globalThis.PointerEvent) => {
      const dx = next.clientX - originX;
      const dy = next.clientY - originY;
      if (!dragged.current && Math.hypot(dx, dy) < 5) return;
      dragged.current = true;
      el.style.zIndex = "6";
      el.style.translate = `${dx}px ${dy}px`;
    };
    const up = (next: globalThis.PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.style.zIndex = "";
      el.style.translate = "";
      if (!dragged.current) return;
      const col = Math.round((icon.col * COL + next.clientX - originX) / COL);
      const row = Math.round((icon.row * ROW + next.clientY - originY) / ROW);
      moveIcon(icon.id, col, row);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <nav className="fox-apps" aria-label="デスクトップ">
      {icons.map((icon) => (
        <button
          key={icon.id}
          type="button"
          className="fox-app"
          style={{ left: 12 + icon.col * COL, top: 10 + icon.row * ROW }}
          onPointerDown={(event) => drag(event, icon)}
          onClick={() => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            open(icon);
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setMenu({ id: icon.id, x: event.clientX, y: event.clientY });
          }}
        >
          <FoxMark />
          {edit === icon.id ? (
            <input
              className="fox-icon-edit"
              value={draft}
              aria-label="アイコン名"
              autoFocus
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => {
                renameIcon(icon.id, draft);
                setEdit(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  renameIcon(icon.id, draft);
                  setEdit(null);
                }
              }}
            />
          ) : (
            <span>{icon.label}</span>
          )}
        </button>
      ))}
      {menu ? (
        <div className="fox-context" style={{ left: menu.x, top: menu.y }} role="menu">
          <button
            type="button"
            onClick={() => {
              const icon = icons.find((item) => item.id === menu.id);
              if (icon) open(icon);
              setMenu(null);
            }}
          >
            開く
          </button>
          <button
            type="button"
            onClick={() => {
              const icon = icons.find((item) => item.id === menu.id);
              setDraft(icon?.label ?? "");
              setEdit(menu.id);
              setMenu(null);
            }}
          >
            名前の変更
          </button>
        </div>
      ) : null}
    </nav>
  );
}
