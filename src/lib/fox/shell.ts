import { useEffect, useMemo, useState } from "react";
import { BRAND } from "@/lib/fox/brand";
import { useFox } from "@/lib/fox/store";

export { NetWindow } from "@/lib/fox/net-window";

const CREATURES = [
  { id: "fox", label: "狐" },
  { id: "hare", label: "兎" },
  { id: "crow", label: "烏" },
  { id: "koi", label: "鯉" },
  { id: "beetle", label: "虫" },
  { id: "fern", label: "羊歯" },
  { id: "none", label: "なし" },
];

export function emblemSrc(creature: string) {
  if (creature === "fox") return "/emblem.png";
  if (creature === "none") return "";
  const glyph = CREATURES.find((item) => item.id === creature)?.label ?? "F";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#14080c"/><text x="16" y="22" text-anchor="middle" font-size="16" fill="#f6f1ea" font-family="sans-serif">${glyph}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function MorphText({ text }: { text: string }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let step = 0;
    const id = window.setInterval(() => {
      step += 1;
      const locked = Math.floor(step / 3);
      const head = text.slice(0, locked);
      const flicker = locked < text.length ? "ｱｲｳ#*01"[step % 7] : "";
      setOut(head + flicker);
      if (locked >= text.length) window.clearInterval(id);
    }, 42);
    return () => window.clearInterval(id);
  }, [text]);
  return <span>{out}</span>;
}

export function LookPanel() {
  const creature = useFox((s) => s.creature);
  const emblemOn = useFox((s) => s.emblemOn);
  const promptName = useFox((s) => s.promptName);
  const plugins = useFox((s) => s.plugins);
  const setLook = useFox((s) => s.setLook);
  const addPlugin = useFox((s) => s.addPlugin);
  const [name, setName] = useState(promptName);
  const [idea, setIdea] = useState("");
  const kinds = ["txt", "md", "py", "js", "ts", "json", "png", "svg", "mp3", "iso", "pdf", "zip"];

  return (
    <div className="fox-extra">
      <h2>見た目</h2>
      <MorphText text="名前もエンブレムも、机の中だけで変わります。人の情報は外へ送りません。" />
      <label>
        プロンプト名
        <input value={name} aria-label="プロンプト名" onChange={(event) => setName(event.target.value)} />
      </label>
      <button type="button" className="fox-btn" onClick={() => setLook({ promptName: name.trim() || BRAND.prompt })}>
        ターミナル名を変える
      </button>
      <div className="fox-kinds">
        {CREATURES.map((item) => (
          <button key={item.id} type="button" className={creature === item.id ? "is-on" : ""} onClick={() => setLook({ creature: item.id, emblemOn: item.id !== "none" })}>
            {item.label}
          </button>
        ))}
        <button type="button" className={!emblemOn ? "is-on" : ""} onClick={() => setLook({ emblemOn: !emblemOn })}>
          {emblemOn ? "エンブレムを消す" : "エンブレムを戻す"}
        </button>
      </div>
      <h2>ルール</h2>
      <p>傷つけない。意見の勝ち負けは追わない。合否より、一緒にいることを先にする。これがこの机のアサーティブなジンテーゼです。</p>
      <h2>プラグイン</h2>
      <p>少ない意見も、ここに残します。自動では公開しません。</p>
      <input value={idea} aria-label="アイデア" placeholder="入れたいソフト" onChange={(event) => setIdea(event.target.value)} />
      <button
        type="button"
        className="fox-btn"
        onClick={() => {
          if (!idea.trim()) return;
          addPlugin(idea.trim(), "Grok Bot の更新候補（この机だけ）");
          setIdea("");
        }}
      >
        更新候補にする
      </button>
      <ul>
        {plugins.map((item) => (
          <li key={item.name}>
            {item.name} · {item.note}
          </li>
        ))}
      </ul>
      <h2>拡張子</h2>
      <p>{kinds.join("  ")} はエクスプローラのテキストとして開けます。実在の専用ソフトの全部は、このブラウザには入っていません。</p>
    </div>
  );
}

export function FurryWindow() {
  const [seed, setSeed] = useState("雨の駅");
  const [out, setOut] = useState("ここに生成結果が出ます。外部のクレジットは使いません。");
  const make = (kind: string) => {
    if (kind === "文") setOut(`${seed}。机の上の狐狸が、無限に見える回数だけこの文を書き直せる。回数の上限は、このウィンドウを閉じるまでです。`);
    if (kind === "音") {
      setOut("読み上げます。");
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance(seed));
    }
    if (kind === "絵") setOut(`絵の種: ${seed}。学習データは送っていません。`);
  };
  return (
    <div className="fox-extra">
      <h2>Furrysys</h2>
      <p>名前は Furrysys。無制限に見えるのは机の中だけです。共産主義的、というのはここでは「席がある人は同じ生成机を使える」という意味です。</p>
      <input value={seed} aria-label="種" onChange={(event) => setSeed(event.target.value)} />
      <div className="fox-kinds">
        <button type="button" onClick={() => make("文")}>文</button>
        <button type="button" onClick={() => make("音")}>音</button>
        <button type="button" onClick={() => make("絵")}>絵</button>
      </div>
      <pre>{out}</pre>
    </div>
  );
}

export function InariWindow() {
  const makeEntry = useFox((s) => s.makeEntry);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState("");
  const [text, setText] = useState("");
  const [log, setLog] = useState<{ who: string; text: string }[]>([]);
  const leave = () => {
    const body = log.map((item) => `${item.who}: ${item.text}`).join("\n");
    makeEntry("/home/fox/inari-log.txt", body || `${joined} は無言で出ました`);
    setJoined("");
    setLog([]);
  };
  return (
    <div className="fox-extra">
      <h2>Inari</h2>
      <p>表示上の番地は 127.0.0.1:80 です。このブラウザはポート80を占有しません。部屋はメモリの中です。ISO は GitHub に上げません。ログは机のファイルに残します。</p>
      {joined ? (
        <>
          <p>{joined} が入室しています</p>
          <ul>
            {log.map((item, index) => (
              <li key={`${item.who}-${index}`}>
                {item.who}: {item.text}
              </li>
            ))}
          </ul>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!text.trim()) return;
              setLog((list) => [...list, { who: joined, text: text.trim() }]);
              setText("");
            }}
          >
            <input value={text} aria-label="発言" onChange={(event) => setText(event.target.value)} />
            <button type="submit" className="fox-btn">送る</button>
          </form>
          <button type="button" className="fox-btn" onClick={leave}>
            退室してログを保存
          </button>
        </>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            setJoined(name.trim());
          }}
        >
          <input value={name} aria-label="名前" placeholder="名前だけ" onChange={(event) => setName(event.target.value)} />
          <button type="submit" className="fox-btn">入室</button>
        </form>
      )}
    </div>
  );
}

type Point = { x: number; y: number };

const TUBE = [
  { name: "北", d: "M8,78 C22,62 28,48 42,38 C56,28 68,22 88,18" },
  { name: "中央", d: "M12,52 C28,58 38,46 52,44 C66,42 74,56 90,62" },
  { name: "南", d: "M10,22 C24,36 36,58 50,68 C64,78 78,74 92,58" },
];

const WIRES = [
  "M6,90 C20,70 18,40 34,28 C50,16 62,30 78,18",
  "M8,12 C22,30 16,55 36,62 C54,70 70,48 92,40",
  "M14,80 C30,50 48,78 66,46 C78,28 84,60 94,22",
  "M4,48 C24,40 40,18 58,34 C72,48 80,20 96,30",
  "M10,34 C28,22 44,44 60,24 C74,8 86,36 94,14",
];

export function AtlasWindow() {
  const [place, setPlace] = useState("地下");
  const [points, setPoints] = useState<Point[]>([
    { x: 18, y: 72 },
    { x: 46, y: 38 },
    { x: 74, y: 58 },
  ]);
  const [key, setKey] = useState("granborough");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("WIRE · 難読");
  const [hex, setHex] = useState("00 00");
  const view = open ? encrypt(points, key) : points;
  const route = view.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  useEffect(() => {
    const id = window.setInterval(() => {
      const a = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
      const b = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
      setHex(`${a} ${b}`);
    }, 120);
    return () => window.clearInterval(id);
  }, []);

  const applyKey = () => {
    const hit = key.trim().toLowerCase() === "granborough" || key.trim().toLowerCase() === "skyfall";
    setOpen(true);
    setStatus(hit ? "経路が解けました" : "鍵不一致 · 線は絡んだままです");
  };

  return (
    <div className="fox-extra">
      <h2>地下網</h2>
      <p>{place}。鍵を入れると絡んだ線が経路になり、粒子が走ります。映像の構図を、この机の赤と金に変えています。</p>
      <label>
        場所
        <input value={place} aria-label="場所" onChange={(event) => setPlace(event.target.value)} />
      </label>
      <label>
        鍵
        <input value={key} aria-label="鍵" onChange={(event) => setKey(event.target.value)} />
      </label>
      <p className={open ? "fox-warn" : ""}>{status}</p>
      <div className={`fox-map-frame${open ? " is-open" : ""}`}>
        <svg viewBox="0 0 100 100" className="fox-map" onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          setPoints((list) => [...list, { x, y }]);
          setOpen(false);
          setStatus("点を足しました。鍵で解いてください。");
        }}>
          {(open ? TUBE.map((line) => line.d) : WIRES).map((d) => (
            <path key={d} d={d} className={open ? "fox-tube" : "fox-wire"} />
          ))}
          <path d={route} className="fox-route" />
          {open ? (
            <circle r="1.1" className="fox-particle">
              <animateMotion dur="3.2s" repeatCount="indefinite" path={TUBE[1].d} />
            </circle>
          ) : null}
          {view.map((point, index) => (
            <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="1.5" className="fox-node" />
          ))}
        </svg>
        <span className="fox-map-hex">{hex}</span>
      </div>
      <button type="button" className="fox-btn" onClick={applyKey}>鍵を使う</button>
      <button type="button" className="fox-btn" onClick={() => { setOpen(false); setStatus("線を戻しました。"); }}>閉じる</button>
      <button type="button" className="fox-btn" onClick={() => { setPoints([]); setOpen(false); setStatus("消しました。"); }}>消す</button>
    </div>
  );
}

function encrypt(points: Point[], word: string): Point[] {
  const salt = [...word].reduce((sum, char) => sum + char.charCodeAt(0), 3);
  return points.map((point, index) => ({
    x: (point.x + ((salt * (index + 1)) % 37)) % 100,
    y: (point.y + ((salt * (index + 2)) % 29)) % 100,
  }));
}

function hexByte() {
  return Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
}

const SIGS = ["de ad", "ca fe", "ba be", "fe ed"];

function hexLine(virus: boolean) {
  const cells = Array.from({ length: 8 }, hexByte);
  if (virus) {
    const sig = SIGS[Math.floor(Math.random() * SIGS.length)].split(" ");
    cells[2] = sig[0];
    cells[3] = sig[1];
  }
  return cells.join(" ");
}

function hasSig(line: string) {
  return SIGS.some((s) => line.includes(s));
}

const LAYERS = [
  { id: "バンカー", y: 88, label: "Bunker" },
  { id: "B1", y: 72, label: "B1" },
  { id: "1F", y: 56, label: "1F" },
  { id: "2F", y: 40, label: "2F" },
  { id: "3F", y: 24, label: "3F" },
  { id: "屋上", y: 8, label: "Roof" },
] as const;

export type DeskLayer = (typeof LAYERS)[number]["id"];

export function HexRail({
  layer = "1F",
  onLayer,
}: {
  layer?: string;
  onLayer?: (id: string) => void;
}) {
  const pushNote = useFox((s) => s.pushNote);
  const [lines, setLines] = useState<string[]>(() => Array.from({ length: 18 }, () => hexLine(false)));
  const [hits, setHits] = useState(0);
  const [alert, setAlert] = useState<{ sig: string; at: string } | null>(null);
  const [paused, setPaused] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setLines((prev) => {
        const next = hexLine(Math.random() < 0.18);
        if (hasSig(next)) {
          const sig = SIGS.find((s) => next.includes(s)) ?? "de ad";
          setHits((h) => h + 1);
          setAlert({ sig, at: new Date().toLocaleTimeString("ja-JP", { hour12: false }) });
        }
        return [next, ...prev].slice(0, 24);
      });
    }, 90);
    return () => window.clearInterval(id);
  }, [paused]);

  const clearCache = () => {
    setLines(Array.from({ length: 18 }, () => hexLine(false)));
    setHits(0);
    setAlert(null);
    try {
      if ("caches" in window) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    pushNote("HEX解析バッファとキャッシュをクリアしました");
  };

  const neutralize = (index: number) => {
    setLines((prev) =>
      prev.map((item, at) => {
        if (at !== index) return item;
        let out = item;
        for (const s of SIGS) out = out.replace(s, "00 00");
        return out;
      }),
    );
    setAlert(null);
  };

  return (
    <>
      <aside className="fox-rail" aria-label="16進数解析">
        <div style={{ padding: "6px 8px 4px", fontSize: 11, letterSpacing: "0.06em", opacity: 0.9 }}>
          HEX解析 · 痕跡 {hits}
        </div>
        <div className="fox-hex">
          {lines.map((line, index) => {
            const bad = hasSig(line);
            return (
              <button
                key={`${line}-${index}`}
                type="button"
                style={bad ? { color: "#ff6b6b", fontWeight: 600 } : undefined}
                onClick={() => {
                  if (!bad) return;
                  neutralize(index);
                }}
                title={bad ? "クリックで中和" : undefined}
              >
                {line}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 4, padding: 6, flexWrap: "wrap" }}>
          <button type="button" className="fox-btn" style={{ fontSize: 11, padding: "2px 6px" }} onClick={() => setPaused((p) => !p)}>
            {paused ? "再開" : "一時停止"}
          </button>
          <button type="button" className="fox-btn" style={{ fontSize: 11, padding: "2px 6px" }} onClick={clearCache}>
            クリア
          </button>
          <button type="button" className="fox-btn" style={{ fontSize: 11, padding: "2px 6px" }} onClick={() => setMapOpen(true)}>
            階層
          </button>
        </div>
      </aside>

      {alert ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="ハッキング検知"
          style={{
            position: "fixed",
            right: 200,
            bottom: 72,
            zIndex: 80,
            minWidth: 260,
            maxWidth: 320,
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(40,8,12,0.94)",
            border: "1px solid #e31c2b",
            boxShadow: "0 0 24px rgba(227,28,43,0.35)",
            color: "#f6f1ea",
            fontFamily: "IBM Plex Mono, monospace",
          }}
        >
          <div style={{ fontSize: 12, letterSpacing: "0.08em", color: "#ff8a8a", marginBottom: 6 }}>DETECT</div>
          <strong style={{ display: "block", marginBottom: 6 }}>ハッキング痕跡を検知</strong>
          <p style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.45 }}>
            シグネチャ <code style={{ color: "#ffd24a" }}>{alert.sig}</code>
            <br />
            時刻 {alert.at}
            <br />
            机の中の解析バッファのみ。実機通信は監視していません。
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" className="fox-btn" onClick={() => setAlert(null)}>閉じる</button>
            <button type="button" className="fox-btn" onClick={clearCache}>バッファ消去</button>
          </div>
        </div>
      ) : null}

      {mapOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="階層マップ"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            display: "grid",
            placeItems: "center",
            background: "rgba(8,4,6,0.72)",
          }}
          onClick={() => setMapOpen(false)}
        >
          <div
            style={{
              width: "min(420px, 92vw)",
              padding: 16,
              borderRadius: 12,
              background: "rgba(20,10,14,0.96)",
              border: "1px solid rgba(255,210,74,0.35)",
              color: "#f6f1ea",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>仮想デスクトップ階層</h2>
            <p style={{ margin: "0 0 12px", fontSize: 13, opacity: 0.8 }}>バンカーから屋上まで。透過マップ上の六角を選んで移動します。</p>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: 220 }}>
              {LAYERS.map((item, i) => {
                const cy = item.y;
                return (
                  <polygon
                    key={item.id}
                    points={`50,${cy - 7} 62,${cy - 2} 62,${cy + 5} 50,${cy + 10} 38,${cy + 5} 38,${cy - 2}`}
                    fill={item.id === layer ? "rgba(255,210,74,0.35)" : "rgba(246,241,234,0.08)"}
                    stroke={item.id === layer ? "#ffd24a" : "rgba(246,241,234,0.25)"}
                    strokeWidth="0.8"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      onLayer?.(item.id);
                      pushNote(`仮想デスクトップ → ${item.id}`);
                      setMapOpen(false);
                    }}
                  />
                );
              })}
              <text x="50" y="96" textAnchor="middle" fill="rgba(246,241,234,0.5)" fontSize="3.2">
                透過マップ · クリックで移動
              </text>
            </svg>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {LAYERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="fox-btn"
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    outline: item.id === layer ? "1px solid #ffd24a" : undefined,
                  }}
                  onClick={() => {
                    onLayer?.(item.id);
                    pushNote(`仮想デスクトップ → ${item.id}`);
                    setMapOpen(false);
                  }}
                >
                  {item.id}
                  <small style={{ opacity: 0.7, marginLeft: 4 }}>{item.label}</small>
                </button>
              ))}
            </div>
            <button type="button" className="fox-btn" style={{ marginTop: 12 }} onClick={() => setMapOpen(false)}>
              閉じる
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function SatWindow() {
  return (
    <div className="fox-extra">
      <h2>SAT</h2>
      <p>衛星枠のプレースホルダ。Atlas の同意付き地図を使ってください。</p>
    </div>
  );
}
