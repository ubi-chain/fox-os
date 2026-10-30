export type SnapMode = "free" | "left" | "right" | "max" | "tl" | "tr" | "bl" | "br";

export function stageSize() {
  const stage = document.querySelector(".fox-stage");
  return { width: stage?.clientWidth ?? 960, height: stage?.clientHeight ?? 640 };
}

export function snapFrame(width: number, height: number, mode: Exclude<SnapMode, "free">) {
  const pad = 8;
  const halfW = Math.round(width / 2) - 14;
  const halfH = Math.round(height / 2) - 14;
  const fullW = width - 16;
  const fullH = height - 16;
  if (mode === "left") return { x: pad, y: pad, w: halfW, h: fullH };
  if (mode === "right") return { x: Math.round(width / 2) + 4, y: pad, w: halfW, h: fullH };
  if (mode === "tl") return { x: pad, y: pad, w: halfW, h: halfH };
  if (mode === "tr") return { x: Math.round(width / 2) + 4, y: pad, w: halfW, h: halfH };
  if (mode === "bl") return { x: pad, y: Math.round(height / 2) + 4, w: halfW, h: halfH };
  if (mode === "br") return { x: Math.round(width / 2) + 4, y: Math.round(height / 2) + 4, w: halfW, h: halfH };
  return { x: pad, y: pad, w: fullW, h: fullH };
}
