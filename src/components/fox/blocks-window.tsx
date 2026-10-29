import { useState } from "react";
import { useFox, type WinKind } from "@/lib/fox/store";

type Step =
  | { id: string; op: "say"; text: string }
  | { id: string; op: "wait"; n: number }
  | { id: string; op: "term"; text: string }
  | { id: string; op: "open"; app: "term" | "dict" | "browser" | "sky" }
  | { id: string; op: "repeat"; n: number; body: Step[] };

const PALETTE: { op: Step["op"]; label: string; hint: string }[] = [
  { op: "say", label: "はなす", hint: "きつねが言う" },
  { op: "wait", label: "まつ", hint: "秒数だけ待つ" },
  { op: "term", label: "コマンド", hint: "ターミナルへ送る" },
  { op: "open", label: "ひらく", hint: "ソフトを開く" },
  { op: "repeat", label: "くりかえす", hint: "中を数回" },
];

function uid() {
  return `${Date.now()}-${Math.random()}`;
}

function blank(op: Step["op"]): Step {
  if (op === "say") return { id: uid(), op, text: "こんにちは" };
  if (op === "wait") return { id: uid(), op, n: 1 };
  if (op === "term") return { id: uid(), op, text: "echo こんにちは" };
  if (op === "open") return { id: uid(), op, app: "term" };
  return { id: uid(), op, n: 2, body: [] };
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function BlocksWindow() {
  const openWindow = useFox((s) => s.openWindow);
  const submit = useFox((s) => s.submit);
  const [script, setScript] = useState<Step[]>([blank("say")]);
  const [bubble, setBubble] = useState("フラグを押してね");
  const [running, setRunning] = useState(false);
  const [nest, setNest] = useState<string | null>(null);

  const add = (op: Step["op"]) => {
    const step = blank(op);
    if (!nest) {
      setScript((list) => [...list, step]);
      return;
    }
    setScript((list) =>
      list.map((item) => (item.op === "repeat" && item.id === nest ? { ...item, body: [...item.body, step] } : item)),
    );
  };

  const playSteps = async (steps: Step[]) => {
    for (const step of steps) {
      if (step.op === "say") setBubble(step.text);
      if (step.op === "wait") await sleep(Math.min(5, Math.max(0, step.n)) * 1000);
      if (step.op === "term") {
        setBubble(step.text);
        submit(step.text);
      }
      if (step.op === "open") openWindow(step.app as WinKind);
      if (step.op === "repeat") {
        const times = Math.min(5, Math.max(1, step.n));
        for (let i = 0; i < times; i += 1) await playSteps(step.body);
      }
    }
  };

  const run = async () => {
    if (running) return;
    setRunning(true);
    setBubble("スタート");
    await playSteps(script);
    setBubble("おわり");
    setRunning(false);
  };

  const renderStep = (step: Step, parent: Step[] , setParent: (next: Step[]) => void) => (
    <li key={step.id} className={`fox-block is-${step.op}`}>
      {step.op === "say" ? (
        <>
          はなす
          <input
            value={step.text}
            aria-label="せりふ"
            onChange={(event) => setParent(parent.map((item) => (item.id === step.id && item.op === "say" ? { ...item, text: event.target.value } : item)))}
          />
        </>
      ) : null}
      {step.op === "wait" ? (
        <>
          <input
            type="number"
            min={0}
            max={5}
            value={step.n}
            aria-label="待つ秒"
            onChange={(event) => setParent(parent.map((item) => (item.id === step.id && item.op === "wait" ? { ...item, n: Number(event.target.value) } : item)))}
          />
          びょうまつ
        </>
      ) : null}
      {step.op === "term" ? (
        <>
          コマンド
          <input
            value={step.text}
            aria-label="ターミナルコマンド"
            onChange={(event) => setParent(parent.map((item) => (item.id === step.id && item.op === "term" ? { ...item, text: event.target.value } : item)))}
          />
        </>
      ) : null}
      {step.op === "open" ? (
        <>
          ひらく
          <select
            value={step.app}
            aria-label="開くソフト"
            onChange={(event) => {
              const app = event.target.value as "term" | "dict" | "browser" | "sky";
              setParent(parent.map((item) => (item.id === step.id && item.op === "open" ? { ...item, app } : item)));
            }}
          >
            <option value="term">ターミナル</option>
            <option value="dict">辞典</option>
            <option value="browser">ブラウザ</option>
            <option value="sky">FoxSky</option>
          </select>
        </>
      ) : null}
      {step.op === "repeat" ? (
        <>
          <input
            type="number"
            min={1}
            max={5}
            value={step.n}
            aria-label="くりかえす回数"
            onChange={(event) => setParent(parent.map((item) => (item.id === step.id && item.op === "repeat" ? { ...item, n: Number(event.target.value) } : item)))}
          />
          かいくりかえす
          <button type="button" onClick={() => setNest(nest === step.id ? null : step.id)}>
            {nest === step.id ? "ここに入る" : "中に入れる"}
          </button>
          <ul>{step.body.map((child) => renderStep(child, step.body, (body) => setParent(parent.map((item) => (item.id === step.id && item.op === "repeat" ? { ...item, body } : item)))))}</ul>
        </>
      ) : null}
      <button
        type="button"
        aria-label="はずす"
        onClick={() => setParent(parent.filter((item) => item.id !== step.id))}
      >
        ×
      </button>
    </li>
  );

  return (
    <div className="fox-blocks">
      <aside>
        <p>ブロックをつなげてプログラム</p>
        {PALETTE.map((item) => (
          <button key={item.op} type="button" className={`fox-block is-${item.op}`} onClick={() => add(item.op)}>
            {item.label}
            <small>{item.hint}</small>
          </button>
        ))}
      </aside>
      <div className="fox-script">
        <button type="button" className="fox-flag" disabled={running} onClick={() => void run()}>
          {running ? "うごいてる" : "フラグ"}
        </button>
        <ul>{script.map((step) => renderStep(step, script, setScript))}</ul>
      </div>
      <div className="fox-stage">
        <p className="fox-bubble">{bubble}</p>
        <img src="/favicon.svg" alt="" />
      </div>
    </div>
  );
}
