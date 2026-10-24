import { useEffect, useRef, useState } from "react";
import { armBootSound, holdBootSound, playBootSound, releaseBootSound, takeBootSound } from "@/lib/fox/boot-sound";
import { useFox } from "@/lib/fox/store";
import { FoxMark } from "./fox-mark";

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
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = (x + size * Math.cos(angle)).toFixed(1);
        const py = (y + size * Math.sin(angle)).toFixed(1);
        points += `${i === 0 ? "" : " "}${px},${py}`;
      }
      cells.push({ points, delay: `${(dist * 2.2).toFixed(0)}ms` });
    }
  }
  return cells;
}

const CELLS = hiveCells();

export function BootOverlay() {
  const finishBoot = useFox((s) => s.finishBoot);
  const [leaving, setLeaving] = useState(false);
  const [audible, setAudible] = useState(false);
  const done = useRef(false);
  const sound = useRef<ReturnType<typeof playBootSound> | null>(null);
  const ticket = useRef(0);

  const adopt = (voice: ReturnType<typeof playBootSound>) => {
    sound.current = voice;
    ticket.current = holdBootSound(voice);
    setAudible(true);
  };

  const start = () => {
    if (done.current || audible) return;
    const voice = playBootSound();
    adopt(voice);
    void voice.resume();
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setAudible(true);
      return;
    }
    const armed = takeBootSound();
    if (armed?.running) adopt(armed);
    else {
      if (armed) armed.stop();
      const trial = playBootSound();
      if (trial.running) adopt(trial);
      else trial.stop();
    }
    return () => {
      const voice = sound.current;
      const heldTicket = ticket.current;
      window.setTimeout(() => {
        if (voice) releaseBootSound(voice, heldTicket);
      }, 0);
    };
  }, []);

  useEffect(() => {
    if (!audible) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = reduce ? 400 : 3600;
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
  }, [audible, finishBoot]);

  return (
    <div className={`fox-boot${audible ? " is-audible" : ""}${leaving ? " is-leaving" : ""}`}>
      <svg className="fox-hive" viewBox="0 0 1200 740" aria-hidden="true">
        {CELLS.map((cell, index) => (
          <polygon key={index} points={cell.points} style={{ animationDelay: cell.delay }} />
        ))}
      </svg>
      <div className="fox-boot-center">
        <FoxMark />
        <h1>FOX OS</h1>
        <button
          type="button"
          className="fox-btn fox-btn-accent fox-login-go"
          onClick={() => {
            armBootSound();
            done.current = true;
            finishBoot();
          }}
        >
          LOGIN
        </button>
      </div>
    </div>
  );
}
