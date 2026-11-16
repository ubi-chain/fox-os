import { useEffect, useState } from "react";
import { useFox } from "@/lib/fox/store";

const HOTSPOTS = [
  { name: "STARLINK", km: 550, open: true, wire: false, kind: "sat" as const },
  { name: "地上波-橋", km: 12, open: true, wire: true, kind: "terrestrial" as const },
  { name: "FREE-CAFE", km: 0.04, open: true, wire: false, kind: "local" as const },
  { name: "HOTEL-LOBBY", km: 0.11, open: true, wire: true, kind: "local" as const },
  { name: "STATION-FREE", km: 0.28, open: true, wire: false, kind: "local" as const },
];

export function NetWindow() {
  const pushNote = useFox((s) => s.pushNote);
  const [uplink, setUplink] = useState<"starlink" | "terrestrial" | "local" | "foxnet">("starlink");
  const [bridge, setBridge] = useState(false);
  const [link, setLink] = useState("STARLINK");
  const [note, setNote] = useState(
    "主経路は Starlink。サーバー実機は用意せず、机の中で衛星→地上波ブリッジを模擬します。実在の電波は掴んでいません。",
  );
  const [frame, setFrame] = useState(0);
  const [latency, setLatency] = useState(42);
  const [foxnetOn, setFoxnetOn] = useState(false);
  const [foxnetPort, setFoxnetPort] = useState(369);
  const [gigaUsed, setGigaUsed] = useState(0.12);
  const pickFoxPort = () => {
    const pool = [369, 10369, 20369, 30369, 44000, 44369, 51234, 52888, 60009, 61234];
    return pool[Math.floor(Math.random() * pool.length)] ?? 369;
  };
  useEffect(() => {
    const id = window.setInterval(() => setFrame((n) => (n + 8) % 280), 80);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    const id = window.setInterval(() => {
      const base =
        uplink === "starlink" ? 38 : uplink === "terrestrial" ? 12 : uplink === "foxnet" ? 22 : 4;
      setLatency(base + Math.floor(Math.random() * 18));
    }, 900);
    return () => window.clearInterval(id);
  }, [uplink]);
  useEffect(() => {
    if (!foxnetOn) return;
    const id = window.setInterval(() => {
      setGigaUsed((g) => Math.round((g + 0.003 + Math.random() * 0.008) * 1000) / 1000);
    }, 2400);
    return () => window.clearInterval(id);
  }, [foxnetOn]);

  const engageStarlink = () => {
    setUplink("starlink");
    setLink("STARLINK");
    setNote("Starlink を主経路に設定しました。衛星ビームは机の中のシミュレーションです。");
    pushNote?.("回線: Starlink 主経路");
  };

  const bridgeToTerrestrial = () => {
    setBridge(true);
    setUplink("terrestrial");
    setLink("地上波-橋");
    setNote(
      "Starlink → 地上波ブリッジを机の中で接続しました。衛星側を upstream、地上波を last-mile として扱います。実サーバは立てていません。",
    );
    pushNote?.("回線: Starlink → 地上波ブリッジ");
  };

  const rollFoxPort = () => {
    const port = pickFoxPort();
    setFoxnetPort(port);
    pushNote?.(`FoxNet ポート抽選 → ${port}（KDDI衛星枠・机内）`);
    return port;
  };

  const toggleFoxNet = () => {
    const next = !foxnetOn;
    setFoxnetOn(next);
    if (next) {
      const port = pickFoxPort();
      setFoxnetPort(port);
      setUplink("foxnet");
      setNote(
        `FoxNet プライベートリレー ON（ポート ${port}・ランダム）。KDDI 衛星経路を机の中で中継します。ギガは無制限枠です。`,
      );
      pushNote?.(`FoxNet リレー ON · KDDI衛星 · port ${port} · ギガ無制限`);
    } else {
      setUplink("starlink");
      setNote("FoxNet を切りました。主経路は Starlink に戻しています。");
      pushNote?.("FoxNet リレー OFF");
    }
  };

  return (
    <div className="fox-extra">
      <h2>回線 · Starlink 主経路</h2>
      <p>{note}</p>
      <p style={{ fontSize: 12, opacity: 0.8 }}>
        現在経路:{" "}
        <strong>
          {uplink === "starlink"
            ? "Starlink"
            : uplink === "terrestrial"
              ? "地上波ブリッジ"
              : uplink === "foxnet"
                ? "FoxNet リレー"
                : "ローカル"}
        </strong>
        {" · "}
        遅延模擬 {latency} ms
        {bridge ? " · ブリッジ ON" : ""}
        {foxnetOn ? " · FoxNet ON" : ""}
      </p>
      <div className="fox-kinds" style={{ marginBottom: 10 }}>
        <button type="button" className={uplink === "starlink" ? "is-on" : ""} onClick={engageStarlink}>
          Starlink 主
        </button>
        <button type="button" className={bridge ? "is-on" : ""} onClick={bridgeToTerrestrial}>
          地上波へブリッジ
        </button>
        <button type="button" className={foxnetOn ? "is-on" : ""} onClick={toggleFoxNet}>
          FoxNet リレー
        </button>
        <button
          type="button"
          className={uplink === "local" ? "is-on" : ""}
          onClick={() => {
            setUplink("local");
            setLink("FREE-CAFE");
            setBridge(false);
            setFoxnetOn(false);
            setNote("ローカル開放ポイントへ切り替えました（机の中のみ）。");
          }}
        >
          ローカル
        </button>
      </div>
      <ul>
        {HOTSPOTS.map((item) => (
          <li key={item.name}>
            <button
              type="button"
              className={link === item.name ? "is-on" : ""}
              onClick={() => {
                setLink(item.name);
                if (item.kind === "sat") engageStarlink();
                else if (item.kind === "terrestrial") bridgeToTerrestrial();
                else {
                  setUplink("local");
                  setBridge(false);
                  setFoxnetOn(false);
                  setNote(`${item.name} に机の中で接続しました。`);
                }
              }}
            >
              {item.name}
              {item.kind === "sat" ? " · 衛星" : item.kind === "terrestrial" ? " · 地上波" : ` · ${item.km} km`}
              {item.wire ? " 有線" : " wifi"}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="fox-btn"
        onClick={() =>
          setNote("ホテルの有線を机の中でセットアップしました。壁の差込口は操作していません。Starlink 主経路はそのままです。")
        }
      >
        ホテルの有線（補助）
      </button>

      <h2>FoxNet · スマホ プライベートリレー（KDDI衛星）</h2>
      <p style={{ fontSize: 13, lineHeight: 1.5 }}>
        KDDI 衛星を想定した机内プライベートリレー。端末の出口を FoxNet 経由にします。ポートはランダム抽選（369 を含む候補）。実キャリアの課金や制限は触りません。
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        ポート
        <input
          type="number"
          min={1024}
          max={65535}
          value={foxnetPort}
          aria-label="FoxNet ポート"
          style={{ width: 96 }}
          onChange={(event) => {
            const n = Number(event.target.value);
            if (Number.isFinite(n)) setFoxnetPort(Math.max(1024, Math.min(65535, Math.floor(n))));
          }}
        />
        <span style={{ fontSize: 12, opacity: 0.7 }}>（抽選例 369）</span>
      </label>
      <div className="fox-kinds" style={{ marginBottom: 8 }}>
        <button type="button" className={foxnetOn ? "is-on" : ""} onClick={toggleFoxNet}>
          {foxnetOn ? "FoxNet ON" : "FoxNet を入れる"}
        </button>
        <button type="button" onClick={rollFoxPort}>
          ポート抽選
        </button>
        <button
          type="button"
          onClick={() => {
            setFoxnetPort(369);
            pushNote?.("FoxNet ポートを 369 に固定しました");
          }}
        >
          369 固定
        </button>
      </div>
      <p style={{ fontSize: 13, margin: "6px 0" }}>
        ギガ枠: <strong>無制限</strong>
        {" · "}
        使用量（模擬） {gigaUsed.toFixed(3)} GB
        {" · "}
        上限なし
      </p>
      <p style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.45 }}>
        経路イメージ: スマホ → FoxNet:{foxnetPort}（KDDI衛星枠）→ Starlink 主 → 必要なら地上波ブリッジ。サーバー実機は不要です。
      </p>

      <h2>経路メモ</h2>
      <p style={{ fontSize: 13, lineHeight: 1.5 }}>
        サーバー実機は不要。上流は Starlink、地上波はブリッジ先、スマホ出口は FoxNet（KDDI衛星想定・ポートはランダム／369 可・ギガ無制限）です。
      </p>
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
