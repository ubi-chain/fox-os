export type DeskIcon = {
  id: string;
  kind: "term" | "dev" | "ai" | "sys" | "browser" | "explorer" | "chat" | "dict" | "pkg" | "blocks" | "sky" | "guard" | "net" | "hako" | "furry" | "inari" | "shogi" | "atlas" | "lab" | "exe" | "bin";
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
  { id: "sys", kind: "sys", label: "SYS", col: 1, row: 0 },
  { id: "cht", kind: "chat", label: "CHT", col: 1, row: 1 },
  { id: "dict", kind: "dict", label: "DICT", col: 1, row: 2 },
  { id: "pkg", kind: "pkg", label: "PKG", col: 1, row: 3 },
  { id: "kids", kind: "blocks", label: "KIDS", col: 1, row: 4 },
  { id: "sky", kind: "sky", label: "SKY", col: 2, row: 0 },
  { id: "exe", kind: "exe", label: "EXE", col: 2, row: 1 },
  { id: "bin", kind: "bin", label: "BIN", col: 2, row: 2 },
  { id: "net", kind: "net", label: "NET", col: 3, row: 0 },
  { id: "hako", kind: "hako", label: "HAKO", col: 3, row: 1 },
  { id: "furry", kind: "furry", label: "FURRY", col: 3, row: 2 },
  { id: "inari", kind: "inari", label: "IRC", col: 3, row: 3 },
  { id: "shogi", kind: "shogi", label: "将棋", col: 3, row: 4 },
  { id: "atlas", kind: "atlas", label: "MAP", col: 4, row: 0 },
  { id: "lab", kind: "lab", label: "LAB", col: 4, row: 1 },
];

function free(icons: DeskIcon[], col: number, row: number, except: string) {
  return !icons.some((icon) => icon.id !== except && icon.col === col && icon.row === row);
}

export function settleIcon(icons: DeskIcon[], id: string, col: number, row: number) {
  const c = Math.max(0, Math.min(14, col));
  const r = Math.max(0, Math.min(4, row));
  if (free(icons, c, r, id)) return { col: c, row: r };
  for (let radius = 1; radius < 16; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const nextCol = c + dx;
        const nextRow = r + dy;
        if (nextCol < 0 || nextRow < 0 || nextCol > 14 || nextRow > 4) continue;
        if (free(icons, nextCol, nextRow, id)) return { col: nextCol, row: nextRow };
      }
    }
  }
  return { col: c, row: r };
}
