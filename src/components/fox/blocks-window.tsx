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

const TAG: Record<Step["op"], string> = {
  say: "はなす",
  wait: "まつ",
  term: "コマンド",
  open: "ひらく",
  repeat: "くりかえす",
};

const APP_NAME: Record<"term" | "dict" | "browser" | "sky", string> = {
  term: "ターミナル",
  dict: "辞典",
  browser: "ブラウザ",
  sky: "FoxSky",
};

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

function escape(text: string) {
  return text.replaceAll("&", "\u0026amp;").replaceAll("<", "\u0026lt;").replaceAll(">", "\u0026gt;");
}

function unescape(text: string) {
  return text.replaceAll("\u0026lt;", "<").replaceAll("\u0026gt;", ">").replaceAll("\u0026amp;", "&");
}

function serialize(steps: Step[], pad = 0): string {
  const gap = "  ".repeat(pad);
  return steps
    .map((step) => {
      if (step.op === "say") return `${gap}<はなす>${escape(step.text)}</はなす>`;
      if (step.op === "wait") return `${gap}<まつ>${step.n}</まつ>`;
      if (step.op === "term") return `${gap}<コマンド>${escape(step.text)}</コマンド>`;
      if (step.op === "open") return `${gap}<ひらく>${APP_NAME[step.app] ?? step.app}</ひらく>`;
      return `${gap}<くりかえす 回数="${step.n}">\n${serialize(step.body, pad + 1)}\n${gap}</くりかえす>`;
    })
    .join("\n");
}

function appOf(label: string): "term" | "dict" | "browser" | "sky" {
  if (/辞典|dict/i.test(label)) return "dict";
  if (/ブラウザ|browser|web/i.test(label)) return "browser";
  if (/sky|電話/i.test(label)) return "sky";
  return "term";
}

function parse(source: string): Step[] {
  const tokens = source.match(/<\/?[\u3040-\u30ff\w]+(?:\s+回数="\d+")?\s*>|[^<]+/g) ?? [];
  const root: Step[] = [];
  const stack: { steps: Step[]; closer?: string }[] = [{ steps: root }];
  for (const token of tokens) {
    const open = token.match(/^<(はなす|まつ|コマンド|ひらく)>$/);
    const close = token.match(/^<\/(はなす|まつ|コマンド|ひらく|くりかえす)>$/);
    const repeat = token.match(/^<くりかえす(?:\s+回数="(\d+)")?\s*>$/);
    if (open) {
      const op = (Object.keys(TAG) as Step["op"][]).find((key) => TAG[key] === open[1])!;
      const step = blank(op);
      stack.at(-1)!.steps.push(step);
      stack.push({ steps: [], closer: open[1] });
      continue;
    }
    if (repeat) {
      const step = blank("repeat");
      if (step.op === "repeat") step.n = Number(repeat[1] ?? 2);
      stack.at(-1)!.steps.push(step);
      stack.push({ steps: step.op === "repeat" ? step.body : [], closer: "くりかえす" });
      continue;
    }
    if (close) {
      const frame = stack.pop();
      if (!frame || frame.closer !== close[1]) throw new Error(`</${close[1]}> の位置が違います`);
      const parent = stack.at(-1)!.steps.at(-1);
      const text = frame.steps.map((item) => ("text" in item ? item.text : "")).join("").trim();
      if (parent && parent.op === "say") parent.text = unescape(text) || "こんにちは";
      if (parent && parent.op === "wait") parent.n = Number(text) || 1;
      if (parent && parent.op === "term") parent.text = unescape(text) || "echo こんにちは";
      if (parent && parent.op === "open") parent.app = appOf(unescape(text));
      continue;
    }
    const text = token.trim();
    if (!text) continue;
    const leaf = stack.at(-1);
    if (leaf?.closer) leaf.steps.push({ id: uid(), op: "say", text });
  }
  if (stack.length !== 1) throw new Error("閉じ忘れのタグがあります");
  return root;
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function toPython(steps: Step[], pad = 0): string {
  const gap = "    ".repeat(pad);
  if (steps.length === 0) return `${gap}pass`;
  return steps
    .map((step) => {
      if (step.op === "say") return `${gap}print(${JSON.stringify(step.text)})  # はなす`;
      if (step.op === "wait") return `${gap}time.sleep(${step.n})  # ${step.n}びょうまつ`;
      if (step.op === "term") return `${gap}run(${JSON.stringify(step.text)})  # コマンド`;
      if (step.op === "open") return `${gap}open_app(${JSON.stringify(APP_NAME[step.app])})  # ひらく`;
      return `${gap}for _ in range(${step.n}):  # くりかえす\n${toPython(step.body, pad + 1)}`;
    })
    .join("\n");
}

function program(steps: Step[]) {
  return [
    "# つないだブロックから作った Python",
    "import time",
    "",
    "def run(command):",
    '    print("ターミナル:", command)',
    "",
    "def open_app(name):",
    '    print("ひらく:", name)',
    "",
    toPython(steps),
    "",
  ].join("\n");
}

const SAMPLES: { title: string; teach: string; tags: string }[] = [
  {
    title: "あいさつ",
    teach: "print は文字を出す命令です。はなすブロックがこの1行になります。",
    tags: "<はなす>こんにちは</はなす>",
  },
  {
    title: "くりかえす",
    teach: "for は中の行を回数ぶん繰り返します。字下げ（先頭の空白）が「中」の印です。",
    tags: '<くりかえす 回数="3">\n  <はなす>がんばって</はなす>\n</くりかえす>',
  },
  {
    title: "待つ",
    teach: "time.sleep は秒数だけ止まります。まつブロックの数字が秒です。",
    tags: "<はなす>用意</はなす>\n<まつ>1</まつ>\n<はなす>スタート</はなす>",
  },
  {
    title: "コマンド",
    teach: "run はターミナルへ命令を送ります。echo は文字を表示する命令です。",
    tags: "<コマンド>echo こんにちは</コマンド>",
  },
];

export function BlocksWindow() {
  const openWindow = useFox((s) => s.openWindow);
  const submit = useFox((s) => s.submit);
  const [script, setScript] = useState<Step[]>([blank("say")]);
  const [source, setSource] = useState(serialize([blank("say")]));
  const [error, setError] = useState("");
  const [bubble, setBubble] = useState("タグを書いてフラグを押してね");
  const [running, setRunning] = useState(false);
  const [lesson, setLesson] = useState(SAMPLES[0].teach);

  const applySource = (next: string) => {
    setSource(next);
    try {
      setScript(parse(next));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "読めません");
    }
  };

  const add = (op: Step["op"]) => {
    const next = [...script, blank(op)];
    setScript(next);
    setSource(serialize(next));
    setError("");
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
    let steps = script;
    try {
      steps = parse(source);
      setScript(steps);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "読めません");
      return;
    }
    setRunning(true);
    setBubble("スタート");
    await playSteps(steps);
    setBubble("おわり");
    setRunning(false);
  };

  return (
    <div className="fox-blocks">
      <aside>
        <p>タグを追加</p>
        {PALETTE.map((item) => (
          <button key={item.op} type="button" className={`fox-block is-${item.op}`} onClick={() => add(item.op)}>
            {item.label}
            <small>{item.hint}</small>
          </button>
        ))}
        <p>見本</p>
        {SAMPLES.map((sample) => (
          <button
            key={sample.title}
            type="button"
            onClick={() => {
              applySource(sample.tags);
              setLesson(sample.teach);
            }}
          >
            {sample.title}
          </button>
        ))}
      </aside>
      <div className="fox-script">
        <button type="button" className="fox-flag" disabled={running} onClick={() => void run()}>
          {running ? "うごいてる" : "フラグ"}
        </button>
        <textarea
          className="fox-tags"
          aria-label="プログラムのタグ"
          spellCheck={false}
          value={source}
          onChange={(event) => applySource(event.target.value)}
        />
        <p className="fox-note">{error || "文字を直すとツリーが変わります"}</p>
        <ul>
          {script.map((step) => (
            <li key={step.id} className={`fox-block is-${step.op}`}>
              {TAG[step.op]}
              {"text" in step ? ` ${step.text}` : ""}
              {"n" in step && step.op !== "repeat" ? ` ${step.n}` : ""}
              {step.op === "open" ? ` ${APP_NAME[step.app]}` : ""}
              {step.op === "repeat" ? ` ×${step.n}（${step.body.length}）` : ""}
            </li>
          ))}
        </ul>
      </div>
      <div className="fox-kid-stage">
        <p className="fox-note">{lesson}</p>
        <pre className="fox-code" aria-label="生成されたコード">{error ? "# タグを直すとコードが出ます" : program(script)}</pre>
        <p className="fox-bubble">{bubble}</p>
        <img src="/favicon.svg" alt="" />
      </div>
    </div>
  );
}
