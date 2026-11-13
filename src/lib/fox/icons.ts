export type DeskIcon = {
  id: string;
  kind: "term" | "dev" | "ai" | "sys" | "browser" | "explorer" | "chat" | "dict" | "pkg" | "sky" | "guard" | "net" | "furry" | "inari" | "atlas" | "crypt" | "qan" | "ime" | "sat" | "exe" | "bin" | "fwpe" | "faes" | "fbf";
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
  { id: "sky", kind: "sky", label: "SKY", col: 1, row: 4 },
  { id: "exe", kind: "exe", label: "EXE", col: 2, row: 0 },
  { id: "bin", kind: "bin", label: "BIN", col: 2, row: 1 },
  { id: "net", kind: "net", label: "NET", col: 2, row: 2 },
  { id: "furry", kind: "furry", label: "FURRY", col: 2, row: 3 },
  { id: "inari", kind: "inari", label: "IRC", col: 2, row: 4 },
  { id: "atlas", kind: "atlas", label: "MAP", col: 3, row: 0 },
  { id: "crypt", kind: "crypt", label: "CRYPT", col: 3, row: 1 },
  { id: "qan", kind: "qan", label: "QAN", col: 3, row: 2 },
  { id: "ime", kind: "ime", label: "IME", col: 3, row: 3 },
  { id: "sat", kind: "sat", label: "SAT", col: 3, row: 4 },
  { id: "fwpe", kind: "fwpe", label: "FWPE", col: 4, row: 0 },
  { id: "faes", kind: "faes", label: "FAES", col: 4, row: 1 },
  { id: "fbf", kind: "fbf", label: "FBF", col: 4, row: 2 },
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
