import { useMemo, useState } from "react";
import { GRAMMAR, KINDS, lookupDict, translate, type DictEntry, type EnglishKind } from "@/lib/fox/dict";
import { KanaInput } from "./kana-input";

export function GrammarBoard() {
  const [open, setOpen] = useState(0);
  const lesson = GRAMMAR[open];
  return (
    <div className="fox-grammar">
      <aside>
        {GRAMMAR.map((item, index) => (
          <button key={item.title} type="button" className={index === open ? "is-on" : ""} onClick={() => setOpen(index)}>
            {item.title}
          </button>
        ))}
      </aside>
      <article>
        <h2>{lesson.title}</h2>
        <p>{lesson.lead}</p>
        {lesson.points.map((point) => (
          <section key={point.h}>
            <h3>{point.h}</h3>
            <p>{point.body}</p>
            <blockquote>{point.ex}</blockquote>
          </section>
        ))}
      </article>
    </div>
  );
}

export function DictWindow({ initial = "" }: { initial?: string }) {
  const [kind, setKind] = useState<EnglishKind>("米語");
  const [page, setPage] = useState<"translate" | "words" | "grammar">("translate");
  const [query, setQuery] = useState(initial);
  const [source, setSource] = useState(initial);
  const [picked, setPicked] = useState<DictEntry | null>(null);
  const hits = useMemo(() => lookupDict(query, page === "words" ? kind : undefined), [query, kind, page]);
  const current = hits.find((entry) => entry.ja === picked?.ja) ?? hits[0];
  const result = useMemo(() => translate(source, kind), [source, kind]);

  return (
    <div className="fox-dict">
      <header>
        <b>英和・和英</b>
        <div className="fox-dict-pages">
          <button type="button" className={page === "translate" ? "is-on" : ""} onClick={() => setPage("translate")}>
            翻訳
          </button>
          <button type="button" className={page === "words" ? "is-on" : ""} onClick={() => setPage("words")}>
            単語
          </button>
          <button type="button" className={page === "grammar" ? "is-on" : ""} onClick={() => setPage("grammar")}>
            文法
          </button>
        </div>
      </header>
      <div className="fox-kinds" role="tablist" aria-label="英語の種類">
        {KINDS.map((item) => (
          <button key={item} type="button" className={item === kind ? "is-on" : ""} onClick={() => setKind(item)}>
            {item}
          </button>
        ))}
      </div>
      {page === "grammar" ? (
        <GrammarBoard />
      ) : page === "translate" ? (
        <div className="fox-tr">
          <label>
            日本語または英語
            <textarea value={source} aria-label="翻訳する文" placeholder="私は水を飲む / I drink water" onChange={(event) => setSource(event.target.value)} />
          </label>
          <article>
            <small>
              {result.direction} · {kind}
            </small>
            <h2>{result.out || "ここに訳が出ます"}</h2>
            {result.unknown.length ? <p>未収録: {result.unknown.join(" ")}</p> : <p>収録語をつないで訳しています。種類を変えると丁寧さや綴りが変わります。</p>}
          </article>
        </div>
      ) : (
        <>
          <KanaInput value={query} onValue={setQuery} aria-label="辞典の検索" placeholder="単語を検索" />
          <div className="fox-dict-body">
            <ul>
              {hits.map((entry) => (
                <li key={`${entry.ja}-${entry.en}`}>
                  <button type="button" className={current?.ja === entry.ja ? "is-on" : ""} onClick={() => setPicked(entry)}>
                    <strong>{entry.ja}</strong>
                    <span>{entry.en}</span>
                  </button>
                </li>
              ))}
            </ul>
            {current ? (
              <article>
                <small>
                  {current.pos} · {kind}
                </small>
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
        </>
      )}
    </div>
  );
}
