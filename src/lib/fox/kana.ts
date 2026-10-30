const TABLE: Record<string, string> = {
  a: "あ",
  i: "い",
  u: "う",
  e: "え",
  o: "お",
  ka: "か",
  ki: "き",
  ku: "く",
  ke: "け",
  ko: "こ",
  sa: "さ",
  shi: "し",
  si: "し",
  su: "す",
  se: "せ",
  so: "そ",
  ta: "た",
  chi: "ち",
  ti: "ち",
  tsu: "つ",
  tu: "つ",
  te: "て",
  to: "と",
  na: "な",
  ni: "に",
  nu: "ぬ",
  ne: "ね",
  no: "の",
  ha: "は",
  hi: "ひ",
  fu: "ふ",
  hu: "ふ",
  he: "へ",
  ho: "ほ",
  ma: "ま",
  mi: "み",
  mu: "む",
  me: "め",
  mo: "も",
  ya: "や",
  yu: "ゆ",
  yo: "よ",
  ra: "ら",
  ri: "り",
  ru: "る",
  re: "れ",
  ro: "ろ",
  wa: "わ",
  wo: "を",
  ga: "が",
  gi: "ぎ",
  gu: "ぐ",
  ge: "げ",
  go: "ご",
  za: "ざ",
  ji: "じ",
  zi: "じ",
  zu: "ず",
  ze: "ぜ",
  zo: "ぞ",
  da: "だ",
  di: "ぢ",
  du: "づ",
  de: "で",
  do: "ど",
  ba: "ば",
  bi: "び",
  bu: "ぶ",
  be: "べ",
  bo: "ぼ",
  pa: "ぱ",
  pi: "ぴ",
  pu: "ぷ",
  pe: "ぺ",
  po: "ぽ",
  kya: "きゃ",
  kyu: "きゅ",
  kyo: "きょ",
  sha: "しゃ",
  shu: "しゅ",
  sho: "しょ",
  sya: "しゃ",
  syu: "しゅ",
  syo: "しょ",
  cha: "ちゃ",
  chu: "ちゅ",
  cho: "ちょ",
  tya: "ちゃ",
  tyu: "ちゅ",
  tyo: "ちょ",
  nya: "にゃ",
  nyu: "にゅ",
  nyo: "にょ",
  hya: "ひゃ",
  hyu: "ひゅ",
  hyo: "ひょ",
  mya: "みゃ",
  myu: "みゅ",
  myo: "みょ",
  rya: "りゃ",
  ryu: "りゅ",
  ryo: "りょ",
  gya: "ぎゃ",
  gyu: "ぎゅ",
  gyo: "ぎょ",
  ja: "じゃ",
  ju: "じゅ",
  jo: "じょ",
  jya: "じゃ",
  jyu: "じゅ",
  jyo: "じょ",
  zya: "じゃ",
  zyu: "じゅ",
  zyo: "じょ",
  bya: "びゃ",
  byu: "びゅ",
  byo: "びょ",
  pya: "ぴゃ",
  pyu: "ぴゅ",
  pyo: "ぴょ",
  fa: "ふぁ",
  fi: "ふぃ",
  fe: "ふぇ",
  fo: "ふぉ",
  xa: "ぁ",
  xi: "ぃ",
  xu: "ぅ",
  xe: "ぇ",
  xo: "ぉ",
  xya: "ゃ",
  xyu: "ゅ",
  xyo: "ょ",
  la: "ぁ",
  li: "ぃ",
  lu: "ぅ",
  le: "ぇ",
  lo: "ぉ",
  lya: "ゃ",
  lyu: "ゅ",
  lyo: "ょ",
  xtu: "っ",
  xtsu: "っ",
  ltu: "っ",
  ltsu: "っ",
  "-": "ー",
  ",": "、",
  ".": "。",
  "?": "？",
  "!": "！",
};

const PREFIXES = new Set<string>();
for (const key of Object.keys(TABLE)) {
  for (let i = 1; i < key.length; i++) PREFIXES.add(key.slice(0, i));
}

function isConsonant(ch: string) {
  return ch.length === 1 && "bcdfghjklmnpqrstvwxyz".includes(ch);
}

function drain(raw: string): { text: string; buffer: string } {
  let out = "";
  let next = raw;
  let guard = 0;
  while (next && guard++ < 12) {
    if (next.startsWith("nn")) {
      if (next.length === 2) break;
      out += "ん";
      next = "aiueoy".includes(next[2] ?? "") ? next.slice(1) : next.slice(2);
      continue;
    }
    if (next.length >= 2 && next[0] === next[1] && isConsonant(next[0]) && next[0] !== "n") {
      out += "っ";
      next = next.slice(1);
      continue;
    }
    let matched = "";
    const max = Math.min(4, next.length);
    for (let len = max; len >= 1; len--) {
      const head = next.slice(0, len);
      if (TABLE[head]) {
        matched = head;
        break;
      }
    }
    if (matched) {
      out += TABLE[matched];
      next = next.slice(matched.length);
      continue;
    }
    if (next.length >= 2 && next[0] === "n" && isConsonant(next[1]) && next[1] !== "y") {
      out += "ん";
      next = next.slice(1);
      continue;
    }
    if (PREFIXES.has(next) || (next.length === 1 && isConsonant(next))) break;
    out += next[0];
    next = next.slice(1);
  }
  return { text: out, buffer: next };
}

export function pushKana(buffer: string, ch: string): { text: string; buffer: string } {
  return drain(buffer + ch);
}

export function commitKana(buffer: string): string {
  if (!buffer) return "";
  if (buffer === "n" || buffer === "nn") return "ん";
  const { text, buffer: rest } = drain(buffer);
  if (rest === "n") return `${text}ん`;
  return text + rest;
}
