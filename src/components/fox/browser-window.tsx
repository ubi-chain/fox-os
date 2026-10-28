import { useMemo, useState } from "react";
import { previewBody } from "@/lib/fox/model";
import { useFox } from "@/lib/fox/store";
import { DictWindow } from "./dict-window";
import { PkgWindow } from "./pkg-window";

type Tab = {
  id: string;
  title: string;
  url: string;
  draft: string;
  stack: string[];
  index: number;
};

type Mark = { title: string; url: string };
type Hit = { title: string; url: string; at: string };

const session: { marks: Mark[]; history: Hit[]; downloads: { name: string; url: string; state: string }[] } = {
  marks: [
    { title: "ホーム", url: "fox://newtab" },
    { title: "GitHub", url: "https://github.com/ubi-chain/fox-os" },
    { title: "辞典", url: "fox://dict" },
    { title: "パッケージ", url: "fox://pkg" },
  ],
  history: [],
  downloads: [],
};

function titleOf(url: string) {
  if (url === "fox://newtab") return "新しいタブ";
  if (url === "fox://history") return "履歴";
  if (url === "fox://bookmarks") return "ブックマーク";
  if (url === "fox://downloads") return "ダウンロード";
  if (url === "fox://settings") return "設定";
  if (url === "fox://dict") return "辞典";
  if (url === "fox://pkg") return "パッケージ";
  if (url === "fox://preview") return "プレビュー";
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

function fresh(url = "fox://newtab"): Tab {
  return { id: `${Date.now()}-${Math.random()}`, title: titleOf(url), url, draft: url === "fox://newtab" ? "" : url, stack: [url], index: 0 };
}

export function BrowserWindow() {
  const body = useFox((s) => previewBody(s));
  const openWindow = useFox((s) => s.openWindow);
  const [tabs, setTabs] = useState<Tab[]>(() => [fresh()]);
  const [active, setActive] = useState(0);
  const [menu, setMenu] = useState(false);
  const [rev, setRev] = useState(0);
  const tab = tabs[active] ?? tabs[0];

  const go = (raw: string, which = active) => {
    const url = resolve(raw);
    const title = titleOf(url);
    session.history.unshift({ title, url, at: new Date().toLocaleTimeString("ja-JP", { hour12: false }) });
    session.history = session.history.slice(0, 40);
    setTabs((list) =>
      list.map((item, index) => {
        if (index !== which) return item;
        const stack = item.stack.slice(0, item.index + 1).concat(url);
        return { ...item, url, title, draft: url, stack, index: stack.length - 1 };
      }),
    );
    setMenu(false);
    setRev((n) => n + 1);
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

  const toggleStar = () => {
    if (session.marks.some((mark) => mark.url === tab.url)) session.marks = session.marks.filter((mark) => mark.url !== tab.url);
    else session.marks = [{ title: tab.title, url: tab.url }, ...session.marks];
    setRev((n) => n + 1);
  };

  const download = () => {
    const name = tab.url.split("/").pop() || "download.bin";
    session.downloads.unshift({ name, url: tab.url, state: "完了（模擬）" });
    setRev((n) => n + 1);
    go("fox://downloads");
  };

  return (
    <div className="fox-chrome">
      <div className="fox-chrome-tabs">
        {tabs.map((item, index) => (
          <button key={item.id} type="button" className={index === active ? "is-on" : ""} onClick={() => setActive(index)}>
            <span>{item.title}</span>
            <i
              onClick={(event) => {
                event.stopPropagation();
                const next = tabs.filter((_, i) => i !== index);
                const list = next.length ? next : [fresh()];
                setTabs(list);
                setActive(Math.max(0, Math.min(active, list.length - 1)));
              }}
            >
              ×
            </i>
          </button>
        ))}
        <button type="button" className="fox-chrome-add" aria-label="新しいタブ" onClick={() => { setTabs((list) => [...list, fresh()]); setActive(tabs.length); }}>
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
        <button type="button" aria-label="再読み込み" onClick={() => setRev((n) => n + 1)}>
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
          <span>{tab.url.startsWith("https://") ? "🔒" : "🦊"}</span>
          <input
            value={tab.draft}
            aria-label="アドレス"
            placeholder="検索または URL"
            onChange={(event) => {
              const draft = event.target.value;
              setTabs((list) => list.map((item, index) => (index === active ? { ...item, draft } : item)));
            }}
          />
        </form>
        <button type="button" aria-label="ブックマーク" className={starred ? "is-star" : ""} onClick={toggleStar}>
          ★
        </button>
        <button type="button" aria-label="メニュー" onClick={() => setMenu((open) => !open)}>
          ⋮
        </button>
        {menu ? (
          <div className="fox-chrome-menu" role="menu">
            <button type="button" onClick={() => { setTabs((list) => [...list, fresh()]); setActive(tabs.length); setMenu(false); }}>
              新しいタブ
            </button>
            <button type="button" onClick={() => go("fox://history")}>履歴</button>
            <button type="button" onClick={() => go("fox://bookmarks")}>ブックマーク</button>
            <button type="button" onClick={download}>このページをダウンロード</button>
            <button type="button" onClick={() => go("fox://downloads")}>ダウンロード</button>
            <button type="button" onClick={() => go("fox://dict")}>辞典</button>
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
      <div className="fox-chrome-page" key={`${tab.id}-${tab.url}-${rev}`}>
        {tab.url === "fox://newtab" ? (
          <div className="fox-ntp">
            <b>FOX</b>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const field = event.currentTarget.elements.namedItem("q");
                go(field instanceof HTMLInputElement ? field.value : "");
              }}
            >
              <input name="q" aria-label="検索" placeholder="Google のように検索" />
            </form>
            <div>
              <button type="button" onClick={() => go("fox://dict")}>辞典</button>
              <button type="button" onClick={() => go("fox://pkg")}>パッケージ</button>
              <button type="button" onClick={() => go("https://github.com/ubi-chain/fox-os")}>GitHub</button>
              <button type="button" onClick={() => go("fox://preview")}>プレビュー</button>
            </div>
          </div>
        ) : tab.url === "fox://history" ? (
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
          </ul>
        ) : tab.url === "fox://bookmarks" ? (
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
        ) : tab.url === "fox://downloads" ? (
          <ul className="fox-chrome-list">
            {session.downloads.length === 0 ? <li>ダウンロードはありません</li> : null}
            {session.downloads.map((item) => (
              <li key={item.url + item.name}>
                {item.name}
                <small>{item.state} · {item.url}</small>
              </li>
            ))}
          </ul>
        ) : tab.url === "fox://settings" ? (
          <div className="fox-chrome-card">
            <h2>設定</h2>
            <p>ダークの Chrome 風ブラウザです。検索はアドレス欄から DuckDuckGo を開きます。外部サイトは埋め込みを拒否することがあります。</p>
            <p>起動時のページは新しいタブです。ブックマークは ★ で付けます。</p>
          </div>
        ) : tab.url === "fox://dict" ? (
          <div className="fox-chrome-embed">
            <button type="button" onClick={() => openWindow("dict")}>辞典アプリで開く</button>
            <DictWindow />
          </div>
        ) : tab.url === "fox://pkg" ? (
          <div className="fox-chrome-embed">
            <button type="button" onClick={() => openWindow("pkg")}>パッケージアプリで開く</button>
            <PkgWindow />
          </div>
        ) : tab.url === "fox://preview" ? (
          <pre className="fox-chrome-card">{body}</pre>
        ) : (
          <iframe title={tab.title} src={tab.url} />
        )}
      </div>
    </div>
  );
}
