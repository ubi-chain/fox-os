export type SnapMode = "left" | "right" | "max" | "free" | "tl" | "tr" | "bl" | "br";

export function stageSize(): { width: number; height: number } {
  if (typeof window === "undefined") return { width: 1280, height: 720 };
  return { width: window.innerWidth, height: window.innerHeight - 48 };
}

export function snapFrame(
  width: number,
  height: number,
  mode: SnapMode,
): { x: number; y: number; w: number; h: number } {
  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);
  switch (mode) {
    case "left":
      return { x: 0, y: 0, w: halfW, h: height };
    case "right":
      return { x: halfW, y: 0, w: width - halfW, h: height };
    case "max":
      return { x: 0, y: 0, w: width, h: height };
    case "tl":
      return { x: 0, y: 0, w: halfW, h: halfH };
    case "tr":
      return { x: halfW, y: 0, w: width - halfW, h: halfH };
    case "bl":
      return { x: 0, y: halfH, w: halfW, h: height - halfH };
    case "br":
      return { x: halfW, y: halfH, w: width - halfW, h: height - halfH };
    case "free":
    default:
      return { x: 80, y: 60, w: 640, h: 420 };
  }
}
