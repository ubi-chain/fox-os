import { useEffect, useRef, useState } from "react";
import { FoxMark } from "./fox-mark";
import { useFox } from "@/lib/fox/store";

type Cell = { points: string; delay: string };

function hiveCells(): Cell[] {
  const width = 1200;
  const height = 740;
  const size = 22;
  const w = size * Math.sqrt(3);
  const h = size * 1.5;
  const cx = width / 2;
  const cy = height / 2;
  const cells: Cell[] = [];
  for (let row = 0; row * h < height + size; row += 1) {
    for (let col = 0; col * w < width + size; col += 1) {
      const x = col * w + (row % 2 ? w / 2 : 0);
      const y = row * h;
      const dist = Math.hypot(x - cx, y - cy);
      let points = "";
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI / 3) * i;
        const px = (x + size * Math.cos(angle)).toFixed(1);
        const py = (y + size * Math.sin(angle)).toFixed(1);
        points += `${i === 0 ? "" : " "}${px},${py}`;
      }
      cells.push({ points, delay: `${(dist * 1.6).toFixed(0)}ms` });
    }
  }
  return cells;
}

const CELLS = hiveCells();

export function BootOverlay() {
  const finishBoot = useFox((s) => s.finishBoot);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = reduce ? 400 : 3400;
    const fade = window.setTimeout(() => {
      if (done.current) return;
      done.current = true;
      setLeaving(true);
    }, wait);
    const end = window.setTimeout(() => finishBoot(), wait + (reduce ? 0 : 420));
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(end);
    };
  }, [finishBoot]);

  return (
    <div className={leaving ? "fox-boot is-leaving" : "fox-boot"}>
      <p className="fox-boot-phase">HIVE INITIALIZATION</p>
      <svg className="fox-hive" viewBox="0 0 1200 740" aria-hidden="true">
        {CELLS.map((cell, index) => (
          <polygon key={index} points={cell.points} style={{ animationDelay: cell.delay }} />
        ))}
      </svg>
      <div className="fox-boot-center">
        <FoxMark />
        <h1>FOX OS</h1>
        <p>Q DIVISION WORKSTATION</p>
      </div>
      <button
        type="button"
        className="fox-btn fox-boot-skip"
        onClick={() => {
          done.current = true;
          finishBoot();
        }}
      >
        スキップ
      </button>
    </div>
  );
}
