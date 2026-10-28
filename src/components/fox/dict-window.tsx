import { useMemo, useState } from "react";
import { lookupDict, type DictEntry } from "@/lib/fox/dict";
import { KanaInput } from "./kana-input";

export function DictWindow() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<DictEntry | null>(null);
  const hits = useMemo(() => lookupDict(query), [query]);
  const current = picked && hits.includes(picked) ? picked : hits[0];

  return (
    <div className="fox-dict">
      <header>
        <b>和英辞典</b>
        <span>日本語から英語</span>
      </header>
      <KanaInput value={query} onValue={setQuery} aria-label="辞典の検索" placeholder="こんにちは、水、fox…" />
      <div className="fox-dict-body">
        <ul>
          {hits.map((entry) => (
            <li key={`${entry.ja}-${entry.en}`}>
              <button type="button" className={current === entry ? "is-on" : ""} onClick={() => setPicked(entry)}>
                <strong>{entry.ja}</strong>
                <span>{entry.en}</span>
              </button>
            </li>
          ))}
        </ul>
        {current ? (
          <article>
            <small>{current.pos}</small>
            <h2>{current.en}</h2>
            <p>
              {current.ja}
              <span>{current.reading}</span>
            </p>
            <blockquote>{current.example}</blockquote>
          </article>
        ) : (
          <article>見つかりません</article>
        )}
      </div>
    </div>
  );
}
