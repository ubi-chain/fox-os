import { useEffect, useId, useRef, useState } from "react";

type Node = { id: string; name: string; x: number; y: number };
type Arc = { id: number; from: string; to: string; born: number };
type Alert = { id: number; text: string };

const NODES: Node[] = [
  { id: "sfo", name: "サンフランシスコ", x: 150, y: 168 },
  { id: "nyc", name: "ニューヨーク", x: 250, y: 150 },
  { id: "sao", name: "サンパウロ", x: 280, y: 310 },
  { id: "lon", name: "ロンドン", x: 460, y: 130 },
  { id: "fra", name: "フランクフルト", x: 500, y: 145 },
  { id: "jnb", name: "ヨハネスブルグ", x: 530, y: 330 },
  { id: "dxb", name: "ドバイ", x: 610, y: 200 },
  { id: "del", name: "デリー", x: 680, y: 190 },
  { id: "sgp", name: "シンガポール", x: 760, y: 270 },
  { id: "tyo", name: "東京", x: 840, y: 165 },
  { id: "sel", name: "ソウル", x: 820, y: 150 },
  { id: "syd", name: "シドニー", x: 880, y: 360 },
];

const KINDS = ["広域スキャン", "偽サイト観測", "踏み台の疑い", "スキャン応答"] as const;

function ping(audio: AudioContext) {
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(160, now + 0.22);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

export function WwwMap() {
  const grad = useId().replace(/:/g, "");
  const arm = useRef<SVGGElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const [sound, setSound] = useState(false);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const deg = ((now - start) / 26) % 360;
      arm.current?.setAttribute("transform", `rotate(${deg} 500 230)`);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 1600);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (tick === 0) return;
    const a = NODES[Math.floor(Math.random() * NODES.length)];
    const b = NODES[Math.floor(Math.random() * NODES.length)];
    if (!a || !b || a.id === b.id) return;
    const born = Date.now();
    setArcs((prev) => [...prev.filter((arc) => born - arc.born < 4800), { id: born, from: a.id, to: b.id, born }].slice(-5));
    const kind = KINDS[born % KINDS.length];
    setAlerts((prev) => [{ id: born, text: `${a.name} ← ${kind}（${b.name}方面）` }, ...prev].slice(0, 6));
    if (sound && audio.current) ping(audio.current);
  }, [tick, sound]);

  const toggleSound = () => {
    if (!audio.current) audio.current = new AudioContext();
    void audio.current.resume();
    setSound((on) => !on);
  };

  const byId = (id: string) => NODES.find((node) => node.id === id);

  return (
    <div className="fox-www">
      <header>
        <strong>WWW-MAP</strong>
        <span>レーダー · 警報 · 通信弧</span>
        <button type="button" className={`fox-btn${sound ? " fox-btn-accent" : ""}`} onClick={toggleSound}>
          {sound ? "レーダー音 ON" : "レーダー音"}
        </button>
      </header>
      <p className="fox-www-note">机の中だけの模擬です。実在の観測網や全インターネットにはつながっていません。</p>
      <div className="fox-www-stage">
        <svg viewBox="0 0 1000 460" role="img" aria-label="模擬インターネット地図">
          <rect width="1000" height="460" fill="#04140c" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`v${i}`} x1={40 + i * 80} y1={20} x2={40 + i * 80} y2={440} stroke="#14532d" strokeWidth="0.6" />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`h${i}`} x1={20} y1={40 + i * 70} x2={980} y2={40 + i * 70} stroke="#14532d" strokeWidth="0.6" />
          ))}
          <g fill="#0c2418" stroke="#22c55e" strokeWidth="1.2">
            <ellipse cx="210" cy="190" rx="120" ry="78" />
            <ellipse cx="250" cy="310" rx="55" ry="70" />
            <ellipse cx="490" cy="150" rx="70" ry="48" />
            <ellipse cx="530" cy="250" rx="78" ry="90" />
            <ellipse cx="720" cy="190" rx="130" ry="70" />
            <ellipse cx="860" cy="360" rx="48" ry="36" />
          </g>
          <g ref={arm}>
            <path d={`M500 230 L500 40 A190 190 0 0 1 680 150 Z`} fill={`url(#${grad})`} />
          </g>
          <defs>
            <radialGradient id={grad} cx="0" cy="0" r="1">
              <stop offset="0%" stopColor="#86efac" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>
          {arcs.map((arc) => {
            const from = byId(arc.from);
            const to = byId(arc.to);
            if (!from || !to) return null;
            const mx = (from.x + to.x) / 2;
            const my = Math.min(from.y, to.y) - 50;
            return (
              <path
                key={arc.id}
                className="fox-www-arc"
                d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
                fill="none"
                stroke="#bef264"
                strokeWidth="1.6"
              />
            );
          })}
          {NODES.map((node) => (
            <g key={node.id}>
              <circle className="fox-www-node" cx={node.x} cy={node.y} r="4.5" />
              <text x={node.x + 7} y={node.y - 6} fill="#a7f3d0" fontSize="11">
                {node.name}
              </text>
            </g>
          ))}
        </svg>
        <aside>
          <h3>警報</h3>
          {alerts.length === 0 ? <p>走査を待っています</p> : null}
          <ul>
            {alerts.map((alert) => (
              <li key={alert.id}>{alert.text}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
