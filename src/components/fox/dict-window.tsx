import { useMemo, useState } from "react";
import { lookupDict } from "@/lib/fox/dict";
import { KanaInput } from "./kana-input";

export function DictWindow() {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => lookupDict(query), [query]);

  return (
    <div className="fox-dict">
      <KanaInput value={query} onValue={setQuery} aria-label="辞典の検索" placeholder="日本語から英語を検索" />
      <p className="fox-note">{hits.length} 件。日本語・読み・英語で探せます。</p>
      <ul className="fox-dict-list">
        {hits.map((entry) => (
          <li key={`${entry.ja}-${entry.en}`}>
            <strong>{entry.ja}</strong>
            <span>{entry.reading}</span>
            <b>{entry.en}</b>
            <small>
              {entry.pos} · {entry.example}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
