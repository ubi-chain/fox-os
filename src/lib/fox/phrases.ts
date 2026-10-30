const PHRASES: Record<string, { ja: string; how: string }> = {
  hatikvah: { ja: "希望", how: "hatikvah → 希望（ハティクヴァ）" },
  hatikva: { ja: "希望", how: "hatikva → 希望" },
  hope: { ja: "希望", how: "hope → 希望" },
  thanks: { ja: "ありがとう", how: "thanks → ありがとう" },
  thankyou: { ja: "ありがとう", how: "thank you → ありがとう" },
  hello: { ja: "こんにちは", how: "hello → こんにちは" },
  peace: { ja: "平和", how: "peace → 平和" },
  love: { ja: "愛", how: "love → 愛" },
  water: { ja: "水", how: "water → 水" },
  friend: { ja: "友", how: "friend → 友" },
  please: { ja: "お願い", how: "please → お願い" },
  sorry: { ja: "ごめん", how: "sorry → ごめん" },
  yes: { ja: "はい", how: "yes → はい" },
  no: { ja: "いいえ", how: "no → いいえ" },
  shalom: { ja: "平和", how: "shalom → 平和" },
  toda: { ja: "ありがとう", how: "toda → ありがとう" },
  salam: { ja: "平和", how: "salam → 平和" },
  shukran: { ja: "ありがとう", how: "shukran → ありがとう" },
  "תקוה": { ja: "希望", how: "תקווה → 希望" },
  "שלום": { ja: "平和", how: "שלום → 平和" },
  "תודה": { ja: "ありがとう", how: "תודה → ありがとう" },
  "سلام": { ja: "平和", how: "سلام → 平和" },
  "شكرا": { ja: "ありがとう", how: "شكرا → ありがとう" },
  "ماء": { ja: "水", how: "ماء → 水" },
};

const FIXES: [RegExp, string][] = [
  [/\bI is\b/g, "I am"],
  [/\bhe don't\b/gi, "he doesn't"],
  [/\bshe don't\b/gi, "she doesn't"],
  [/ですです/g, "です"],
  [/ますます/g, "ます"],
  [/わたしは私は/g, "私は"],
];

export function lookupPhrase(word: string): { ja: string; how: string } | null {
  const key = word.trim().toLowerCase();
  return PHRASES[key] ?? PHRASES[word.trim()] ?? null;
}

export function convertLast(text: string): { text: string; how: string } | null {
  const match = text.match(/(\S+)$/);
  if (!match || match.index === undefined) return null;
  const hit = lookupPhrase(match[1]);
  if (!hit) return null;
  return { text: text.slice(0, match.index) + hit.ja, how: hit.how };
}

export function polish(text: string): string {
  if (text.startsWith("/") || /^(ls|cd|cat|pwd|apt|git|echo)\b/.test(text)) return text;
  return FIXES.reduce((out, [pattern, next]) => out.replace(pattern, next), text);
}
