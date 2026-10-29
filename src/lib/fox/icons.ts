export type DeskIcon = {
  id: string;
  kind: "term" | "dev" | "ai" | "sys" | "browser" | "explorer" | "chat" | "dict" | "pkg" | "blocks" | "sky" | "guard" | "exe" | "bin";
  label: string;
  col: number;
  row: number;
};

export const ICON_SEED: DeskIcon[] = [
  { id: "web", kind: "browser", label: "WEB", col: 0, row: 0 },
  { id: "exp", kind: "explorer", label: "EXP", col: 0, row: 1 },
  { id: "trm", kind: "term", label: "TRM", col: 0, row: 2 },
  { id: "dev", kind: "dev", label: "DEV", col: 0, row: 3 },
  { id: "ai", kind: "ai", label: "AI", col: 0, row: 4 },
  { id: "sys", kind: "sys", label: "SYS", col: 0, row: 5 },
  { id: "cht", kind: "chat", label: "CHT", col: 0, row: 6 },
  { id: "dict", kind: "dict", label: "DICT", col: 0, row: 7 },
  { id: "pkg", kind: "pkg", label: "PKG", col: 1, row: 1 },
  { id: "kids", kind: "blocks", label: "KIDS", col: 1, row: 2 },
  { id: "sky", kind: "sky", label: "SKY", col: 1, row: 3 },
  { id: "exe", kind: "exe", label: "EXE", col: 0, row: 8 },
  { id: "bin", kind: "bin", label: "BIN", col: 1, row: 0 },
];

function free(icons: DeskIcon[], col: number, row: number, except: string) {
  return !icons.some((icon) => icon.id !== except && icon.col === col && icon.row === row);
}

export function settleIcon(icons: DeskIcon[], id: string, col: number, row: number) {
  const c = Math.max(0, Math.min(14, col));
  const r = Math.max(0, Math.min(9, row));
  if (free(icons, c, r, id)) return { col: c, row: r };
  for (let radius = 1; radius < 16; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const nextCol = c + dx;
        const nextRow = r + dy;
        if (nextCol < 0 || nextRow < 0 || nextCol > 14 || nextRow > 9) continue;
        if (free(icons, nextCol, nextRow, id)) return { col: nextCol, row: nextRow };
      }
    }
  }
  return { col: c, row: r };
}
