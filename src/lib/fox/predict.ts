export type Hint = {
  next: string;
  lang: string;
  program: string;
  grammar: string;
  color: string;
};

const ROWS: Record<string, { grammar: string; color: string; lang: string; program: string; body: string }[]> = {
  crypt: [
    { grammar: "宣言", color: "#ffd24a", lang: "Java", program: "public class Fox { }", body: "public class Fox" },
    { grammar: "手続き", color: "#ffb4a2", lang: "Java", program: "void main(String[] args)", body: "void main" },
    { grammar: "分岐", color: "#e31c2b", lang: "Java", program: "if (ready) save();", body: "if (ready)" },
  ],
  qan: [
    { grammar: "関数", color: "#9fd0ff", lang: "Qan", program: "fn main() { say(\"こんにちは\") }", body: "fn main" },
    { grammar: "翻訳", color: "#c8f7c5", lang: "日本語", program: "say(\"hello\")", body: "こんにちは" },
    { grammar: "翻訳", color: "#d7c4ff", lang: "English", program: "say(\"こんにちは\")", body: "hello" },
    { grammar: "翻訳", color: "#ffd24a", lang: "العربية", program: "say(\"平和\")", body: "سلام" },
  ],
  ime: [
    { grammar: "変換", color: "#ffd24a", lang: "日本語", program: "space で次の候補", body: "かんじ" },
  ],
  ai: [
    { grammar: "依頼", color: "#ffd24a", lang: "日本語", program: "画像を中央に置く", body: "プロンプトを" },
  ],
  term: [
    { grammar: "命令", color: "#ffd24a", lang: "shell", program: "ls -l", body: "ls -l" },
    { grammar: "起動", color: "#ffb4a2", lang: "shell", program: "/open crypt.exe", body: "/open " },
  ],
  dict: [
    { grammar: "見出し", color: "#c8f7c5", lang: "日本語", program: "英語へ訳す", body: "翻訳" },
  ],
};

const EMPTY: Hint = { next: "", lang: "", program: "", grammar: "", color: "#ffd24a" };

export function predict(typed: string, kind: string): Hint {
  const rows = ROWS[kind] ?? ROWS.term;
  const tail = typed.replace(/\s+$/, "");
  let best = rows[0];
  let next = best.body.slice(0, 3);
  let score = -1;
  for (const row of rows) {
    const limit = Math.min(row.body.length, tail.length);
    for (let n = limit; n >= 0; n -= 1) {
      if (n > 0 && !tail.endsWith(row.body.slice(0, n))) continue;
      const rest = row.body.slice(n, n + 3);
      if (!rest) continue;
      if (n > score) {
        score = n;
        best = row;
        next = rest;
      }
      break;
    }
  }
  if (!next) return EMPTY;
  return { next, lang: best.lang, program: best.program, grammar: best.grammar, color: best.color };
}
