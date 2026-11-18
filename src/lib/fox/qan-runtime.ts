/**
 * Qan mini-runtime — π as constant + local entry (no external credits).
 * Geometry π matches docs/geometry-studio-reference.md.
 */

export const PI = Math.PI;
export const PI_DISPLAY = "3.14159265";

export type QanLine = { kind: "out" | "err" | "sys"; text: string };

export type QanResult = {
  lines: QanLine[];
  value?: number;
};

const BUILTIN: Record<string, number> = {
  pi: PI,
  π: PI,
  PI: PI,
  e: Math.E,
  tau: PI * 2,
  τ: PI * 2,
};

export function degToRad(deg: number): number {
  return (deg * PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / PI;
}

export function circumference(r: number): number {
  return 2 * PI * r;
}

export function circleArea(r: number): number {
  return PI * r * r;
}

export function piCall(args: string[]): QanResult {
  const a = args.map((s) => s.trim()).filter(Boolean);
  if (a.length === 0) {
    return { lines: [{ kind: "out", text: String(PI) }], value: PI };
  }
  const head = a[0].toLowerCase();
  if (head === "circ" || head === "円周" || head === "circumference") {
    const r = Number(a[1]);
    if (!Number.isFinite(r)) return { lines: [{ kind: "err", text: "π(円周, 半径) の半径が数ではありません" }] };
    const v = circumference(r);
    return { lines: [{ kind: "out", text: String(v) }], value: v };
  }
  if (head === "deg" || head === "度" || head === "degree") {
    const d = Number(a[1]);
    if (!Number.isFinite(d)) return { lines: [{ kind: "err", text: "π(度, n) の n が数ではありません" }] };
    const v = degToRad(d);
    return { lines: [{ kind: "out", text: String(v) }], value: v };
  }
  if (head === "rad" || head === "ラジアン" || head === "radian") {
    const x = Number(a[1]);
    if (!Number.isFinite(x)) return { lines: [{ kind: "err", text: "π(ラジアン, n) の n が数ではありません" }] };
    const v = radToDeg(x);
    return { lines: [{ kind: "out", text: String(v) }], value: v };
  }
  if (head === "area" || head === "面積") {
    const r = Number(a[1]);
    if (!Number.isFinite(r)) return { lines: [{ kind: "err", text: "π(面積, 半径) の半径が数ではありません" }] };
    const v = circleArea(r);
    return { lines: [{ kind: "out", text: String(v) }], value: v };
  }
  if (a.length === 1 && Number.isFinite(Number(a[0]))) {
    const r = Number(a[0]);
    const v = circleArea(r);
    return { lines: [{ kind: "out", text: String(v) }], value: v };
  }
  return {
    lines: [
      {
        kind: "sys",
        text: "π はローカル定数／関数です（外部クレジット不要）。例: π  /  π()  /  π(2)  /  π(円周, 2)  /  π(度, 90)",
      },
    ],
  };
}

function stripComment(line: string): string {
  const i = line.indexOf("#");
  const j = line.indexOf("//");
  let cut = line.length;
  if (i >= 0) cut = Math.min(cut, i);
  if (j >= 0) cut = Math.min(cut, j);
  return line.slice(0, cut).trim();
}

function evalExpr(src: string): number {
  let s = src.trim();
  s = s.replace(/π/g, String(PI));
  s = s.replace(/\bPI\b/g, String(PI));
  s = s.replace(/\bpi\b/gi, String(PI));
  s = s.replace(/τ/g, String(PI * 2));
  s = s.replace(/\btau\b/gi, String(PI * 2));
  s = s.replace(/\be\b/g, String(Math.E));
  if (!/^[\d\s+\-*/().eE]+$/.test(s)) {
    throw new Error(`式を評価できません: ${src}`);
  }
  const v = Function(`"use strict"; return (${s});`)();
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`結果が数ではありません: ${src}`);
  return v;
}

export function runQan(source: string): QanResult {
  const lines: QanLine[] = [];
  const vars: Record<string, number> = { ...BUILTIN };
  let last: number | undefined;

  const resolve = (expr: string): number => {
    let e = expr.trim();
    const call = e.match(/^π\s*\((.*)\)\s*$/u) || e.match(/^pi\s*\((.*)\)\s*$/i);
    if (call) {
      const inner = call[1].split(",").map((x) => x.trim());
      const args = inner.map((part) => {
        if (part in vars) return String(vars[part]);
        try {
          if (/^[\d.]+$/.test(part)) return part;
          return String(evalExpr(part.replace(/\b([a-zA-Z_]\w*)\b/g, (m) => (m in vars ? String(vars[m]) : m))));
        } catch {
          return part;
        }
      });
      const res = piCall(args);
      lines.push(...res.lines);
      if (res.value === undefined) throw new Error("π() の結果が空です");
      return res.value;
    }
    e = e.replace(/\b([a-zA-Z_πτ]\w*)\b/gu, (m) => (m in vars ? String(vars[m]) : m));
    return evalExpr(e);
  };

  for (const raw of source.split(/\r?\n/)) {
    const line = stripComment(raw);
    if (!line) continue;

    if (/^π\s*\(/u.test(line) || /^pi\s*\(/i.test(line)) {
      try {
        last = resolve(line);
      } catch (err) {
        lines.push({ kind: "err", text: err instanceof Error ? err.message : String(err) });
      }
      continue;
    }

    if (line === "π" || line === "pi" || line === "PI") {
      lines.push({ kind: "out", text: String(PI) });
      last = PI;
      continue;
    }

    const say = line.match(/^(?:print|say)\s+(.+)$/i);
    if (say) {
      const body = say[1].trim();
      if ((body.startsWith('"') && body.endsWith('"')) || (body.startsWith("'") && body.endsWith("'"))) {
        lines.push({ kind: "out", text: body.slice(1, -1) });
      } else {
        try {
          const v = resolve(body);
          lines.push({ kind: "out", text: String(v) });
          last = v;
        } catch (err) {
          lines.push({ kind: "err", text: err instanceof Error ? err.message : String(err) });
        }
      }
      continue;
    }

    const letm = line.match(/^let\s+([a-zA-Z_]\w*)\s*=\s*(.+)$/i);
    if (letm) {
      try {
        const v = resolve(letm[2]);
        vars[letm[1]] = v;
        lines.push({ kind: "sys", text: `${letm[1]} = ${v}` });
        last = v;
      } catch (err) {
        lines.push({ kind: "err", text: err instanceof Error ? err.message : String(err) });
      }
      continue;
    }

    try {
      const v = resolve(line);
      lines.push({ kind: "out", text: String(v) });
      last = v;
    } catch (err) {
      lines.push({ kind: "err", text: err instanceof Error ? err.message : String(err) });
    }
  }

  if (lines.length === 0) {
    lines.push({
      kind: "sys",
      text: "Qan · π 導入済み（ローカル）。例: π  /  print 2 * π  /  π(2)  /  let r = 3",
    });
  }
  return { lines, value: last };
}

export const QAN_PI_SEED = `# Qan · π（ローカル・クレジット不要）
# 定数
π
# 円の面積 πr²
π(2)
# 円周 2πr
π(円周, 2)
# 90度 → ラジアン
π(度, 90)
# 式
print 2 * π * 10
`;
