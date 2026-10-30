import { useEffect, useMemo, useRef, useState } from "react";
import { previewBody } from "@/lib/fox/model";
import { useFox } from "@/lib/fox/store";
import { DictWindow, GrammarBoard } from "./dict-window";
import { PkgWindow } from "./pkg-window";
import { GuardSite } from "./sky-window";

type Tab = {
  id: string;
  title: string;
  url: string;
  draft: string;
  stack: string[];
  index: number;
  pin: boolean;
  private: boolean;
};

type Mark = { title: string; url: string };
type Hit = { title: string; url: string; at: string };

const session: {
  marks: Mark[];
  history: Hit[];
  closed: Hit[];
  downloads: { name: string; url: string; state: string }[];
  ext: { translate: boolean; block: boolean };
  notes: Record<string, string>;
} = {
  marks: [
    { title: "ホーム", url: "fox://newtab" },
    { title: "GitHub", url: "https://github.com/ubi-chain/fox-os" },
    { title: "辞典", url: "fox://dict" },
    { title: "文法", url: "fox://grammar" },
    { title: "アメーバピグ", url: "https://pigg.ameba.jp/" },
    { title: "PayPal", url: "https://www.paypal.com/" },
  ],
  history: [],
  closed: [],
  downloads: [],
  ext: { translate: true, block: false },
  notes: {},
};

function pathOf(url: string) {
  return url.split("?")[0];
}

function queryOf(url: string) {
  const query = url.split("?")[1];
  if (!query) return "";
  return new URLSearchParams(query).get("q") ?? "";
}

function titleOf(url: string) {
  const path = pathOf(url);
  if (path === "fox://newtab") return "新しいタブ";
  if (path === "fox://history") return "履歴";
  if (path === "fox://bookmarks") return "ブックマーク";
  if (path === "fox://downloads") return "ダウンロード";
  if (path === "fox://settings") return "設定";
  if (path === "fox://dict") return "辞典";
  if (path === "fox://grammar") return "文法";
  if (path === "fox://pkg") return "パッケージ";
  if (path === "fox://guard") return "まもり";
  if (path === "fox://preview") return "プレビュー";
  if (path === "fox://extensions") return "拡張機能";
  if (path === "fox://passwords") return "パスワード";
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
}

function resolve(raw: string) {
  const text = raw.trim();
  if (!text) return "fox://newtab";
  if (/^(fox|https?):\/\//i.test(text)) return text;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(text)) return `https://${text}`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(text)}`;
}

function fresh(url = "https://pigg.ameba.jp/", priv = false): Tab {
  return {
    id: `${Date.now()}-${Math.random()}`,
    title: titleOf(url),
    url,
    draft: url === "fox://newtab" ? "" : url,
    stack: [url],
    index: 0,
    pin: false,
    private: priv,
  };
}

export function BrowserWindow() {
  const body = useFox((s) => previewBody(s));
  const openWindow = useFox((s) => s.openWindow);
  const guardOn = useFox((s) => s.guardOn);
  const [tabs, setTabs] = useState<Tab[]>(() => [fresh()]);
  const [active, setActive] = useState(0);
  const [panel, setPanel] = useState<"menu" | "ext" | "me" | "info" | null>(null);
  const [rev, setRev] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [findOn, setFindOn] = useState(false);
  const [find, setFind] = useState("");
  const [loading, setLoading] = useState(false);
  const [shelf, setShelf] = useState(false);
  const [tabMenu, setTabMenu] = useState<{ index: number; x: number; y: number } | null>(null);
  const [notesOn, setNotesOn] = useState(false);
  const [pageNote, setPageNote] = useState("");
  const box = useRef<HTMLInputElement>(null);
  const tab = tabs[active] ?? tabs[0];
  const path = pathOf(tab.url);

  const go = (raw: string, which = active) => {
    const url = resolve(raw);
    const title = titleOf(url);
    const priv = tabs[which]?.private;
    if (!priv) {
      session.history.unshift({ title, url, at: new Date().toLocaleTimeString("ja-JP", { hour12: false }) });
      session.history = session.history.slice(0, 40);
    }
    setTabs((list) =>
      list.map((item, index) => {
        if (index !== which) return item;
        const stack = item.stack.slice(0, item.index + 1).concat(url);
        return { ...item, url, title, draft: url, stack, index: stack.length - 1 };
      }),
    );
    setPanel(null);
    setTabMenu(null);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 420);
    setRev((n) => n + 1);
  };

  const closeAt = (index: number) => {
    const gone = tabs[index];
    if (gone && !gone.private) session.closed.unshift({ title: gone.title, url: gone.url, at: "閉じた" });
    const next = tabs.filter((_, i) => i !== index);
    const list = next.length ? next : [fresh()];
    setTabs(list);
    setActive(Math.max(0, Math.min(active > index ? active - 1 : active, list.length - 1)));
  };

  const jump = (delta: number) => {
    setTabs((list) =>
      list.map((item, index) => {
        if (index !== active) return item;
        const next = Math.max(0, Math.min(item.stack.length - 1, item.index + delta));
        const url = item.stack[next];
        return { ...item, index: next, url, title: titleOf(url), draft: url };
      }),
    );
  };

  const starred = useMemo(() => session.marks.some((mark) => mark.url === tab.url), [tab.url, rev]);
  const suggestions = useMemo(() => {
    const q = tab.draft.trim().toLowerCase();
    if (!q || q === tab.url.toLowerCase()) return [];
    return [...session.marks, ...session.history]
      .filter((item) => item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q))
      .slice(0, 5);
  }, [tab.draft, tab.url, rev]);

  const toggleStar = () => {
    if (session.marks.some((mark) => mark.url === tab.url)) session.marks = session.marks.filter((mark) => mark.url !== tab.url);
    else session.marks = [{ title: tab.title, url: tab.url }, ...session.marks];
    setRev((n) => n + 1);
  };

  const download = () => {
    const name = path.split("/").pop() || "download.bin";
    session.downloads.unshift({ name, url: tab.url, state: "完了（模擬）" });
    setShelf(true);
    setRev((n) => n + 1);
    setPanel(null);
  };

  useEffect(() => {
    if (!guardOn || session.marks.some((mark) => mark.url === "fox://guard")) return;
    session.marks.unshift({ title: "まもり", url: "fox://guard" });
    setRev((n) => n + 1);
  }, [guardOn]);

  useEffect(() => {
    setPageNote(session.notes[tab.url] ?? "");
  }, [tab.url]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if (event.ctrlKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        box.current?.focus();
      }
      if (event.ctrlKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        setTabs((list) => [...list, fresh()]);
        setActive(tabs.length);
      }
      if (event.ctrlKey && event.key.toLowerCase() === "w") {
        event.preventDefault();
        closeAt(active);
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setTabs((list) => [...list, fresh("fox://newtab", true)]);
        setActive(tabs.length);
      }
      if (event.ctrlKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        go("fox://history");
      }
      if (event.ctrlKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        toggleStar();
      }
      if (event.ctrlKey && event.key.toLowerCase() === "f" && !typing) {
        event.preventDefault();
        setFindOn(true);
      }
      if (event.key === "Escape") setFindOn(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className={`fox-chrome${tab.private ? " is-private" : ""}`}>
      {loading ? <i className="fox-chrome-load" /> : null}
      <div className="fox-chrome-tabs">
        {tabs.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`${index === active ? "is-on" : ""}${item.pin ? " is-pin" : ""}`}
            onClick={() => setActive(index)}
            onContextMenu={(event) => {
              event.preventDefault();
              setTabMenu({ index, x: event.clientX, y: event.clientY });
            }}
          >
            <span>{item.private ? "秘密" : item.pin ? "●" : item.title}</span>
            {item.pin ? null : (
              <i
                onClick={(event) => {
                  event.stopPropagation();
                  closeAt(index);
                }}
              >
                ×
              </i>
            )}
          </button>
        ))}
        <button
          type="button"
          className="fox-chrome-add"
          aria-label="新しいタブ"
          onClick={() => {
            setTabs((list) => [...list, fresh()]);
            setActive(tabs.length);
          }}
        >
          +
        </button>
      </div>
      <div className="fox-chrome-nav">
        <button type="button" aria-label="戻る" disabled={tab.index === 0} onClick={() => jump(-1)}>
          ←
        </button>
        <button type="button" aria-label="進む" disabled={tab.index >= tab.stack.length - 1} onClick={() => jump(1)}>
          →
        </button>
        <button type="button" aria-label="再読み込み" onClick={() => { setLoading(true); window.setTimeout(() => setLoading(false), 420); setRev((n) => n + 1); }}>
          ↻
        </button>
        <button type="button" aria-label="ホーム" onClick={() => go("fox://newtab")}>
          ⌂
        </button>
        <form
          className="fox-omnibox"
          onSubmit={(event) => {
            event.preventDefault();
            go(tab.draft);
          }}
        >
          <button type="button" className="fox-lock" aria-label="サイト情報" onClick={() => setPanel(panel === "info" ? null : "info")}>
            {tab.url.startsWith("https://") ? "🔒" : "🦊"}
          </button>
          <input
            ref={box}
            value={tab.draft}
            aria-label="アドレス"
            placeholder="検索または URL"
            onChange={(event) => {
              const draft = event.target.value;
              setTabs((list) => list.map((item, index) => (index === active ? { ...item, draft } : item)));
            }}
          />
        </form>
        {suggestions.length ? (
          <div className="fox-suggest">
            {suggestions.map((item) => (
              <button key={item.url + item.title} type="button" onClick={() => go(item.url)}>
                {item.title}
                <small>{item.url}</small>
              </button>
            ))}
          </div>
        ) : null}
        <button type="button" aria-label="翻訳" onClick={() => go(`fox://dict?q=${encodeURIComponent(tab.title)}`)}>
          文
        </button>
        <button type="button" aria-label="ページメモ" className={notesOn ? "is-star" : ""} onClick={() => setNotesOn((on) => !on)}>
          メモ
        </button>
        <button type="button" aria-label="ブックマーク" className={starred ? "is-star" : ""} onClick={toggleStar}>
          ★
        </button>
        <button type="button" aria-label="拡張機能" onClick={() => setPanel(panel === "ext" ? null : "ext")}>
          拡張
        </button>
        <button type="button" aria-label="プロフィール" onClick={() => setPanel(panel === "me" ? null : "me")}>
          fox
        </button>
        <button type="button" aria-label="メニュー" onClick={() => setPanel(panel === "menu" ? null : "menu")}>
          ⋮
        </button>
        {panel === "info" ? (
          <div className="fox-chrome-menu" role="dialog">
            <p>{tab.url.startsWith("https://") ? "接続は保護されています（表示）" : "FOX の内部ページです"}</p>
            <p>Cookie とサイトデータはこの机の中だけです。</p>
            <p>カメラ・マイクは使っていません。</p>
          </div>
        ) : null}
        {panel === "ext" ? (
          <div className="fox-chrome-menu" role="menu">
            <button type="button" onClick={() => { session.ext.translate = !session.ext.translate; setRev((n) => n + 1); }}>
              翻訳 {session.ext.translate ? "オン" : "オフ"}
            </button>
            <button type="button" onClick={() => { session.ext.block = !session.ext.block; setRev((n) => n + 1); }}>
              広告を減らす {session.ext.block ? "オン" : "オフ"}
            </button>
            <button type="button" onClick={() => go("fox://extensions")}>拡張機能を管理</button>
          </div>
        ) : null}
        {panel === "me" ? (
          <div className="fox-chrome-menu" role="menu">
            <p>fox · このブラウザだけ</p>
            <button type="button" onClick={() => go("fox://passwords")}>パスワード</button>
            <button type="button" onClick={() => go("fox://settings")}>同期はオフ</button>
          </div>
        ) : null}
        {panel === "menu" ? (
          <div className="fox-chrome-menu" role="menu">
            <button type="button" onClick={() => { setTabs((list) => [...list, fresh()]); setActive(tabs.length); setPanel(null); }}>
              新しいタブ
            </button>
            <button type="button" onClick={() => { setTabs((list) => [...list, fresh("fox://newtab", true)]); setActive(tabs.length); setPanel(null); }}>
              シークレット
            </button>
            <button type="button" onClick={() => go("fox://history")}>履歴</button>
            <button type="button" onClick={() => go("fox://bookmarks")}>ブックマーク</button>
            <button type="button" onClick={download}>ダウンロード</button>
            <button type="button" onClick={() => { setFindOn(true); setPanel(null); }}>ページ内検索</button>
            <button type="button" onClick={() => setZoom((n) => Math.min(160, n + 10))}>拡大 {zoom}%</button>
            <button type="button" onClick={() => setZoom((n) => Math.max(70, n - 10))}>縮小</button>
            <button type="button" onClick={() => setZoom(100)}>等倍</button>
            <button type="button" onClick={() => go("fox://dict")}>辞典</button>
            <button type="button" onClick={() => go("fox://grammar")}>文法</button>
            <button type="button" onClick={() => go("fox://pkg")}>パッケージ</button>
            <button type="button" onClick={() => go("fox://settings")}>設定</button>
          </div>
        ) : null}
      </div>
      <div className="fox-chrome-marks">
        {session.marks.slice(0, 8).map((mark) => (
          <button key={mark.url} type="button" onClick={() => go(mark.url)}>
            {mark.title}
          </button>
        ))}
      </div>
      {findOn ? (
        <form
          className="fox-find"
          onSubmit={(event) => {
            event.preventDefault();
            const finder = window as Window & { find?: (value: string) => boolean };
            if (find) finder.find?.(find);
          }}
        >
          <input value={find} aria-label="ページ内検索" placeholder="ページ内を検索" onChange={(event) => setFind(event.target.value)} />
          <button type="submit">次へ</button>
          <button type="button" onClick={() => setFindOn(false)}>閉じる</button>
        </form>
      ) : null}
      <div className={notesOn ? "fox-chrome-split" : undefined}>
      <div className="fox-chrome-page" style={{ zoom: zoom / 100 }} key={`${tab.id}-${tab.url}-${rev}`}>
        {path === "fox://newtab" ? (
          <div className="fox-ntp">
            <b>{tab.private ? "SECRET" : "FOX"}</b>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const field = event.currentTarget.elements.namedItem("q");
                go(field instanceof HTMLInputElement ? field.value : "");
              }}
            >
              <input name="q" aria-label="検索" placeholder="検索または URL" />
            </form>
            <div>
              <button type="button" onClick={() => go("fox://dict")}>辞典</button>
              <button type="button" onClick={() => go("fox://grammar")}>文法</button>
              <button type="button" onClick={() => go("fox://pkg")}>パッケージ</button>
              {guardOn ? <button type="button" onClick={() => go("fox://guard")}>まもり</button> : null}
              <button type="button" onClick={() => go("https://pigg.ameba.jp/")}>アメーバピグ</button>
              <button type="button" onClick={() => go("https://www.paypal.com/")}>PayPal</button>
            </div>
          </div>
        ) : path === "fox://history" ? (
          <ul className="fox-chrome-list">
            {session.history.length === 0 ? <li>履歴はまだありません</li> : null}
            {session.history.map((item) => (
              <li key={`${item.at}-${item.url}`}>
                <button type="button" onClick={() => go(item.url)}>
                  {item.title}
                  <small>{item.at} · {item.url}</small>
                </button>
              </li>
            ))}
            {session.closed.slice(0, 5).map((item) => (
              <li key={`c-${item.url}`}>
                <button type="button" onClick={() => go(item.url)}>
                  最近閉じた {item.title}
                  <small>{item.url}</small>
                </button>
              </li>
            ))}
          </ul>
        ) : path === "fox://bookmarks" ? (
          <ul className="fox-chrome-list">
            {session.marks.map((item) => (
              <li key={item.url}>
                <button type="button" onClick={() => go(item.url)}>
                  {item.title}
                  <small>{item.url}</small>
                </button>
              </li>
            ))}
          </ul>
        ) : path === "fox://downloads" ? (
          <ul className="fox-chrome-list">
            {session.downloads.length === 0 ? <li>ダウンロードはありません</li> : null}
            {session.downloads.map((item) => (
              <li key={item.url + item.name}>
                {item.name}
                <small>{item.state} · {item.url}</small>
              </li>
            ))}
          </ul>
        ) : path === "fox://settings" ? (
          <div className="fox-chrome-card">
            <h2>設定</h2>
            <p>検索エンジンはアドレス欄の DuckDuckGo です。起動ページは新しいタブです。</p>
            <p>外観はダークです。ズームはメニューから変えられます。今 {zoom}%。</p>
            <button
              type="button"
              onClick={() => {
                session.history = [];
                session.closed = [];
                session.downloads = [];
                setRev((n) => n + 1);
              }}
            >
              閲覧データを消去
            </button>
          </div>
        ) : path === "fox://extensions" ? (
          <div className="fox-chrome-card">
            <h2>拡張機能</h2>
            <p>翻訳 {session.ext.translate ? "オン" : "オフ"}。ページの訳はアドレス右の「文」です。</p>
            <p>広告を減らす {session.ext.block ? "オン" : "オフ"}。これは表示上の切替です。</p>
          </div>
        ) : path === "fox://passwords" ? (
          <div className="fox-chrome-card">
            <h2>パスワード</h2>
            <p>このブラウザはパスワードを保存しません。入力欄の中身は外に送りません。</p>
          </div>
        ) : path === "fox://grammar" ? (
          <div className="fox-chrome-embed">
            <GrammarBoard />
          </div>
        ) : path === "fox://dict" ? (
          <div className="fox-chrome-embed">
            <button type="button" onClick={() => openWindow("dict")}>辞典アプリで開く</button>
            <DictWindow initial={queryOf(tab.url)} />
          </div>
        ) : path === "fox://guard" ? (
          <div className="fox-chrome-embed">
            <GuardSite />
          </div>
        ) : path === "fox://pkg" ? (
          <div className="fox-chrome-embed">
            <button type="button" onClick={() => openWindow("pkg")}>パッケージアプリで開く</button>
            <PkgWindow />
          </div>
        ) : path === "fox://preview" ? (
          <pre className="fox-chrome-card">{body}</pre>
        ) : (
          <iframe
            title={tab.title}
            referrerPolicy="no-referrer"
            src={/^https?:/i.test(tab.url) ? `/api/browse?url=${encodeURIComponent(tab.url)}` : tab.url}
          />
        )}
      </div>
      {notesOn ? (
        <aside className="fox-page-note">
          <b>このページのメモ</b>
          <textarea
            aria-label="ページメモ"
            value={pageNote}
            placeholder="Floorp のように、ページごとのメモです。このブラウザの中だけです。"
            onChange={(event) => {
              const text = event.target.value;
              setPageNote(text);
              session.notes[tab.url] = text;
            }}
          />
        </aside>
      ) : null}
      </div>
      {shelf && session.downloads[0] ? (
        <div className="fox-shelf">
          <span>{session.downloads[0].name}</span>
          <button type="button" onClick={() => go("fox://downloads")}>すべて</button>
          <button type="button" onClick={() => setShelf(false)}>閉じる</button>
        </div>
      ) : null}
      <footer className="fox-chrome-status">
        <span>{tab.private ? "シークレット" : loading ? "読み込み中" : "完了"}</span>
        <span>{zoom}%</span>
      </footer>
      {tabMenu ? (
        <div className="fox-chrome-menu is-tab" style={{ left: 8, top: 36 }} role="menu">
          <button type="button" onClick={() => { setTabs((list) => list.map((item, i) => (i === tabMenu.index ? { ...item, pin: !item.pin } : item))); setTabMenu(null); }}>
            ピン留め
          </button>
          <button type="button" onClick={() => { const src = tabs[tabMenu.index]; setTabs((list) => [...list, { ...fresh(src.url, src.private), pin: false }]); setActive(tabs.length); setTabMenu(null); }}>
            複製
          </button>
          <button type="button" onClick={() => { setTabs((list) => list.filter((_, i) => i === tabMenu.index || list[i].pin)); setActive(0); setTabMenu(null); }}>
            他を閉じる
          </button>
          <button type="button" onClick={() => { closeAt(tabMenu.index); setTabMenu(null); }}>閉じる</button>
        </div>
      ) : null}
    </div>
  );
}
