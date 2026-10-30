import { useEffect, useMemo, useState } from "react";
import { BRAND } from "@/lib/fox/brand";
import { useFox } from "@/lib/fox/store";

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

const HOTSPOTS = [
  { name: "FREE-CAFE", km: 0.04, open: true, wire: false },
  { name: "HOTEL-LOBBY", km: 0.11, open: true, wire: true },
  { name: "STATION-FREE", km: 0.28, open: true, wire: false },
];

export function NetWindow() {
  const nearest = useMemo(() => HOTSPOTS.filter((item) => item.open).sort((a, b) => a.km - b.km)[0], []);
  const [link, setLink] = useState(nearest.name);
  const [note, setNote] = useState("一番近い開放ポイントへ机の中で接続しました。実在の電波は掴んでいません。");
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setFrame((n) => (n + 8) % 280), 80);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="fox-extra">
      <h2>回線</h2>
      <p>{note}</p>
      <ul>
        {HOTSPOTS.map((item) => (
          <li key={item.name}>
            <button type="button" className={link === item.name ? "is-on" : ""} onClick={() => setLink(item.name)}>
              {item.name} · {item.km} km {item.wire ? "有線" : "wifi"}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="fox-btn"
        onClick={() => setNote("ホテルの有線を机の中でセットアップしました。壁の差込口は操作していません。")}
      >
        ホテルの有線
      </button>
      <h2>USB / Bluetooth</h2>
      <p>机の中の端子です。実機の USB や Bluetooth は切り替えていません。</p>
      <p>見えている端子: desk-key · speaker · gamepad</p>
      <h2>遠隔プレイ（模擬）</h2>
      <p>グラボがない机でも、この枠の中だけ絵を動かします。Steam にはつながっていません。</p>
      <div className="fox-stream" aria-hidden>
        <i style={{ transform: `translateX(${frame}px)` }} />
      </div>
    </div>
  );
}

type Gift = { id: string; name: string; yen: number; purpose: string };

function asYen(value: string) {
  const n = Math.floor(Number(value.replace(/,/g, "")));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function splitEven(total: number, people: string[]) {
  if (!people.length || total <= 0) return people.map((name) => ({ name, yen: 0 }));
  const base = Math.floor(total / people.length);
  let rest = total - base * people.length;
  return people.map((name) => {
    const extra = rest > 0 ? 1 : 0;
    rest -= extra;
    return { name, yen: base + extra };
  });
}

export function HakoWindow() {
  const [who, setWho] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [note, setNote] = useState("寄付は円で台帳に残します。カード番号は預かりません。");
  const [holder, setHolder] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [market, setMarket] = useState("150.00");
  const [paypal, setPaypal] = useState("152.25");

  const raised = gifts.reduce((sum, gift) => sum + gift.yen, 0);
  const marketRate = Number(market);
  const paypalRate = Number(paypal);
  const foreign = marketRate > 0 ? raised / marketRate : 0;
  const returned = Number.isFinite(paypalRate) ? Math.round(foreign * paypalRate) : 0;
  const gain = Math.max(0, returned - raised);
  const shares = splitEven(gain, people);

  const record = () => {
    const yen = asYen(amount);
    if (!who.trim() || yen <= 0) {
      setNote("寄付者名と、1円以上の金額を入力してください。");
      return;
    }
    if (/\d(?:[ -]?\d){12,18}/.test(who) || /\d(?:[ -]?\d){12,18}/.test(purpose)) {
      setNote("カード番号は受け付けません。金額だけを記録してください。");
      return;
    }
    setGifts((list) => [{ id: `${Date.now()}`, name: who.trim(), yen, purpose: purpose.trim() || "使途の指定なし" }, ...list]);
    setWho("");
    setAmount("");
    setPurpose("");
    setNote("台帳に記録しました。PayPal への送金は、この画面では行いません。");
  };

  return (
    <div className="fox-extra">
      <h2>奉納箱</h2>
      <p>寄付を受け、円で残す台帳です。ゲームの景品やキーの発行はしません。</p>
      <label>
        寄付者名
        <input value={who} aria-label="寄付者名" onChange={(event) => setWho(event.target.value)} />
      </label>
      <label>
        金額（円）
        <input value={amount} inputMode="numeric" aria-label="寄付金額" onChange={(event) => setAmount(event.target.value)} />
      </label>
      <label>
        使途
        <input value={purpose} aria-label="使途" onChange={(event) => setPurpose(event.target.value)} />
      </label>
      <button type="button" className="fox-btn" onClick={record}>
        台帳に記録する
      </button>
      <p>{note}</p>
      <p>寄付合計 {raised.toLocaleString("ja-JP")} 円 / {gifts.length} 件</p>
      <ul>
        {gifts.map((gift) => (
          <li key={gift.id}>
            {gift.name} · {gift.yen.toLocaleString("ja-JP")} 円 · {gift.purpose}
          </li>
        ))}
      </ul>
      <h2>財布</h2>
      <p>
        寄付合計を基準レートで外貨にし、PayPal のレートで円に戻した差額を為替差益とします。差益は受取人へ等分します。1円未満の端数は、名簿の順に1円ずつ配ります。
      </p>
      <label>
        基準レート（円 / 1USD）
        <input value={market} aria-label="基準レート" onChange={(event) => setMarket(event.target.value)} />
      </label>
      <label>
        PayPal レート（円 / 1USD）
        <input value={paypal} aria-label="PayPalレート" onChange={(event) => setPaypal(event.target.value)} />
      </label>
      <p>
        外貨数量 {foreign.toFixed(2)} USD。円に戻した額 {returned.toLocaleString("ja-JP")} 円。為替差益 {gain.toLocaleString("ja-JP")} 円。
      </p>
      <label>
        受取人
        <input value={holder} aria-label="受取人" onChange={(event) => setHolder(event.target.value)} />
      </label>
      <button
        type="button"
        className="fox-btn"
        onClick={() => {
          const name = holder.trim();
          if (!name || people.includes(name)) return;
          setPeople((list) => [...list, name]);
          setHolder("");
        }}
      >
        受取人を加える
      </button>
      <ul>
        {shares.map((share) => (
          <li key={share.name}>
            {share.name} · {share.yen.toLocaleString("ja-JP")} 円
            <button type="button" onClick={() => setPeople((list) => list.filter((item) => item !== share.name))}>
              外す
            </button>
          </li>
        ))}
      </ul>
      <p>{people.length ? `一人あたりの基準は ${people.length} 人で等分です。` : "受取人がいないため、差益はまだ分配していません。"}</p>
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

const PACKETS = [
  { name: "cafe-beacon", text: "udp/53  模擬ビーコン" },
  { name: "lobby-hello", text: "tcp/80  模擬あいさつ" },
];

export function LabWindow() {
  const asm = useFox((s) => s.asm);
  const [box, setBox] = useState<string[]>([]);
  const [peek, setPeek] = useState("まだのぞいていません。");
  const install = (name: string) => setBox((list) => (list.includes(name) ? list : [...list, name]));
  return (
    <div className="fox-extra">
      <h2>砂場ラボ</h2>
      <p>拾ったパケットとアセンブラは、この砂場に置くだけです。本番のゲーム、他人の衣装、Winsock には届きません。</p>
      {PACKETS.map((item) => (
        <button key={item.name} type="button" onClick={() => install(item.name)}>
          {item.name} を砂場へ
        </button>
      ))}
      {Object.keys(asm).map((name) => (
        <button key={name} type="button" onClick={() => install(name)}>
          アセンブラ {name} を砂場へ
        </button>
      ))}
      <p>砂場: {box.join(" · ") || "空"}</p>
      <button type="button" className="fox-btn" onClick={() => setPeek(box.length ? `${box[0]} は机の中の標本です。それで十分、続きを書けます。` : "先に一つ置いてください。")}>
        のぞく
      </button>
      <p>{peek}</p>
      <h2>見た目の試し</h2>
      <p>自分で書いた服の名前だけ重ねられます。ピグの他人のキャッシュは取得しません。</p>
      <LookDress />
    </div>
  );
}

function LookDress() {
  const [mine, setMine] = useState("白い服");
  const [cloth, setCloth] = useState("赤いスカーフ");
  return (
    <>
      <input value={mine} aria-label="自分の服" onChange={(event) => setMine(event.target.value)} />
      <input value={cloth} aria-label="重ねる名前" onChange={(event) => setCloth(event.target.value)} />
      <p>
        試し: {mine} + {cloth}（この画面だけ）
      </p>
    </>
  );
}

type Point = { x: number; y: number };

export function AtlasWindow() {
  const [place, setPlace] = useState("駅");
  const [points, setPoints] = useState<Point[]>([
    { x: 15, y: 70 },
    { x: 40, y: 40 },
    { x: 70, y: 55 },
  ]);
  const [key, setKey] = useState("skyfall");
  const [locked, setLocked] = useState(false);
  const view = locked ? encrypt(points, key) : points;
  const d = view.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  return (
    <div className="fox-extra">
      <h2>経路の線</h2>
      <p>{place} の模式図です。地図会社の地図は使っていません。線は合言葉でくねらせ、同じ合言葉で戻します。</p>
      <input value={place} aria-label="場所" onChange={(event) => setPlace(event.target.value)} />
      <input value={key} aria-label="合言葉" onChange={(event) => setKey(event.target.value)} />
      <svg viewBox="0 0 100 100" className="fox-map" onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setPoints((list) => [...list, { x, y }]);
        setLocked(false);
      }}>
        <path d={d} />
        {view.map((point, index) => (
          <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="2.2" />
        ))}
      </svg>
      <button type="button" className="fox-btn" onClick={() => setLocked((on) => !on)}>
        {locked ? "解読する" : "線をくねらせる"}
      </button>
      <button type="button" className="fox-btn" onClick={() => { setPoints([]); setLocked(false); }}>
        消す
      </button>
    </div>
  );
}

function encrypt(points: Point[], word: string): Point[] {
  const salt = [...word].reduce((sum, char) => sum + char.charCodeAt(0), 3);
  return points.map((point, index) => ({
    x: (point.x + (salt * (index + 1)) % 37) % 100,
    y: (point.y + (salt * (index + 2)) % 29) % 100,
  }));
}

type Seat = { owner: number; king: boolean } | null;
const SIZE = 5;
const NAMES = ["あなた", "北", "南", "西"];

function freshBoard(): Seat[][] {
  const board = Array.from({ length: SIZE }, () => Array<Seat>(SIZE).fill(null));
  board[0][0] = { owner: 0, king: true };
  board[0][4] = { owner: 1, king: true };
  board[4][0] = { owner: 2, king: true };
  board[4][4] = { owner: 3, king: true };
  board[1][0] = { owner: 0, king: false };
  board[0][3] = { owner: 1, king: false };
  board[3][0] = { owner: 2, king: false };
  board[4][3] = { owner: 3, king: false };
  return board;
}

function legal(board: Seat[][], r: number, c: number, nr: number, nc: number) {
  if (nr < 0 || nc < 0 || nr >= SIZE || nc >= SIZE) return false;
  if (Math.abs(nr - r) + Math.abs(nc - c) !== 1) return false;
  const from = board[r][c];
  const to = board[nr][nc];
  if (!from) return false;
  return !to || to.owner !== from.owner;
}

export function ShogiWindow() {
  const [board, setBoard] = useState(freshBoard);
  const [turn, setTurn] = useState(0);
  const [pick, setPick] = useState<[number, number] | null>(null);
  const [note, setNote] = useState("隣のマスへ。王を取ったら勝ち。足りない席は AI。");
  const [ai, setAi] = useState([false, true, true, true]);
  const [id, setId] = useState("table-1");

  const kings = [0, 1, 2, 3].filter((owner) => board.some((row) => row.some((cell) => cell?.owner === owner && cell.king)));

  const play = (r: number, c: number, nr: number, nc: number, nextBoard = board) => {
    const copy = nextBoard.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
    const piece = copy[r][c];
    if (!piece || !legal(copy, r, c, nr, nc)) return null;
    const hit = copy[nr][nc];
    copy[nr][nc] = piece;
    copy[r][c] = null;
    return { copy, hit };
  };

  const finish = (copy: Seat[][], mover: number, hit: Seat) => {
    setBoard(copy);
    setPick(null);
    if (hit?.king) {
      setNote(`${NAMES[mover]} が王を取りました。`);
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance(`${NAMES[mover]}の勝ち`));
      return;
    }
    setTurn((mover + 1) % 4);
  };

  useEffect(() => {
    if (kings.length < 2) return;
    if (!ai[turn]) return;
    const moves: [number, number, number, number][] = [];
    board.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell?.owner !== turn) return;
        for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]] as [number, number][]) {
          if (legal(board, r, c, nr, nc)) moves.push([r, c, nr, nc]);
        }
      }),
    );
    if (!moves.length) {
      setTurn((turn + 1) % 4);
      return;
    }
    const timer = window.setTimeout(() => {
      const [r, c, nr, nc] = moves[Math.floor(Math.random() * moves.length)];
      const acted = play(r, c, nr, nc);
      if (acted) finish(acted.copy, turn, acted.hit);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [turn, board, ai, kings.length]);

  return (
    <div className="fox-extra">
      <h2>四人将棋</h2>
      <p>子供向け。駒は王と歩。上下左右の隣へドラッグの代わりに、駒を押してからマスを押します。マスの卦は飾りです。通話は ID の部屋名だけで、電話番号は振りません。</p>
      <p>
        部屋 {id} · 手番 {NAMES[turn]}
      </p>
      <input value={id} aria-label="部屋ID" onChange={(event) => setId(event.target.value)} />
      <button type="button" className="fox-btn" onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(`${id} の対局です`))}>
        音声で合図
      </button>
      <div className="fox-kinds">
        {NAMES.map((label, index) => (
          <button key={label} type="button" className={!ai[index] ? "is-on" : ""} onClick={() => setAi((list) => list.map((item, seat) => (seat === index ? !item : item)))}>
            {label} {ai[index] ? "AI" : "人"}
          </button>
        ))}
      </div>
      <div className="fox-shogi" role="grid">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              type="button"
              className={pick && pick[0] === r && pick[1] === c ? "is-on" : ""}
              onClick={() => {
                if (kings.length < 2 || ai[turn]) return;
                if (pick) {
                  const acted = play(pick[0], pick[1], r, c);
                  if (acted) finish(acted.copy, turn, acted.hit);
                  else setPick(cell?.owner === turn ? [r, c] : null);
                  return;
                }
                if (cell?.owner === turn) setPick([r, c]);
              }}
            >
              <small>{"䷀䷁䷂䷃䷄䷅䷆䷇"[(r * 5 + c) % 8]}</small>
              {cell ? <b style={{ color: ["#e31c2b", "#7eb6ff", "#7dcea0", "#f0c14a"][cell.owner] }}>{cell.king ? "王" : "歩"}</b> : null}
            </button>
          )),
        )}
      </div>
      <p>{note}</p>
    </div>
  );
}
