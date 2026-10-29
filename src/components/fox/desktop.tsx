import { useEffect, useState } from "react";
import { armBootSound } from "@/lib/fox/boot-sound";
import { snapFrame, stageSize, type SnapMode } from "@/lib/fox/snap";
import { useFox, type WinKind } from "@/lib/fox/store";
import { BootOverlay } from "./boot-overlay";
import { DeskIcons } from "./desk-icons";
import { DeskWindows } from "./desk-windows";
import { FoxMark } from "./fox-mark";
import { LoginScreen } from "./login-screen";

const ICONS: { kind: WinKind; label: string }[] = [
  { kind: "browser", label: "WEB" },
  { kind: "explorer", label: "EXP" },
  { kind: "term", label: "TRM" },
  { kind: "dev", label: "DEV" },
  { kind: "ai", label: "AI" },
  { kind: "sys", label: "SYS" },
  { kind: "chat", label: "CHT" },
  { kind: "dict", label: "DICT" },
  { kind: "pkg", label: "PKG" },
  { kind: "blocks", label: "KIDS" },
  { kind: "sky", label: "SKY" },
];

const NAMES: Record<WinKind, string> = {
  browser: "ブラウザ",
  explorer: "エクスプローラ",
  term: "ターミナル",
  dev: "Q-DEV",
  ai: "アシスタント",
  sys: "システム",
  chat: "チャット",
  dict: "辞典",
  pkg: "パッケージ",
  blocks: "ブロック",
  sky: "FoxSky",
  guard: "まもり",
};

export function Desktop() {
  const phase = useFox((s) => s.phase);
  const openWindow = useFox((s) => s.openWindow);
  const windows = useFox((s) => s.windows);
  const focusWindow = useFox((s) => s.focusWindow);
  const closeWindow = useFox((s) => s.closeWindow);
  const placeWindow = useFox((s) => s.placeWindow);
  const toggleMin = useFox((s) => s.toggleMin);
  const toggleMax = useFox((s) => s.toggleMax);
  const showDesktop = useFox((s) => s.showDesktop);
  const notes = useFox((s) => s.notes);
  const dismissNote = useFox((s) => s.dismissNote);
  const assist = useFox((s) => s.assist);
  const setAssist = useFox((s) => s.setAssist);
  const files = useFox((s) => s.files);
  const arrangeIcons = useFox((s) => s.arrangeIcons);
  const cascadeWindows = useFox((s) => s.cascadeWindows);
  const tileWindows = useFox((s) => s.tileWindows);
  const pushNote = useFox((s) => s.pushNote);
  const [taskMenu, setTaskMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const termVisual = useFox((s) => s.termVisual);
  const openTerm = useFox((s) => s.openTerm);
  const closeTerm = useFox((s) => s.closeTerm);
  const replayBoot = useFox((s) => s.replayBoot);
  const submit = useFox((s) => s.submit);
  const ime = useFox((s) => s.ime);
  const imeTaps = useFox((s) => s.imeTaps);
  const tapIme = useFox((s) => s.tapIme);
  const lock = useFox((s) => s.lock);
  const sleep = useFox((s) => s.sleep);
  const shutdown = useFox((s) => s.shutdown);
  const wake = useFox((s) => s.wake);
  const powerOn = useFox((s) => s.powerOn);
  const [clock, setClock] = useState("--:--:--");
  const [volume, setVolume] = useState(70);
  const [online, setOnline] = useState(true);
  const [startOpen, setStartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [calendar, setCalendar] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [switchId, setSwitchId] = useState<string | null>(null);
  const [runOpen, setRunOpen] = useState(false);
  const [runText, setRunText] = useState("");
  const [tasksOpen, setTasksOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [bright, setBright] = useState(100);
  const dateLabel = new Date().toLocaleDateString("ja-JP", { dateStyle: "full" });

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("ja-JP", { hour12: false }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (ime !== "direct" || imeTaps === 0) return;
    const id = window.setTimeout(() => {
      const state = useFox.getState();
      if (state.ime === "direct" && state.imeTaps === imeTaps) useFox.setState({ imeTaps: 0 });
    }, 1600);
    return () => window.clearTimeout(id);
  }, [ime, imeTaps]);

  useEffect(() => {
    if (phase !== "desktop" || termVisual !== "opening") return;
    const id = window.setTimeout(() => {
      if (useFox.getState().termVisual === "opening") useFox.setState({ termVisual: "open" });
    }, 700);
    return () => window.clearTimeout(id);
  }, [phase, termVisual]);

  useEffect(() => {
    if (phase !== "desktop") return;
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if (event.key === "Escape") {
        setStartOpen(false);
        setCalendar(false);
        setMenu(null);
        setSwitchId(null);
        setRunOpen(false);
        setTasksOpen(false);
        setQuickOpen(false);
        return;
      }
      if (typing) return;
      const front = [...useFox.getState().windows].sort((a, b) => b.z - a.z).find((win) => !win.min);
      if (event.altKey && event.key === "Tab") {
        event.preventDefault();
        const list = useFox.getState().windows;
        if (list.length === 0) return;
        const order = [...list].sort((a, b) => b.z - a.z);
        const current = order.findIndex((win) => win.id === (front?.id ?? order[0].id));
        const next = order[(current + 1) % order.length];
        focusWindow(next.id);
        setSwitchId(next.id);
        return;
      }
      if (event.altKey && event.key === "F4" && front) {
        event.preventDefault();
        closeWindow(front.id);
        return;
      }
      if (event.altKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        setRunOpen(true);
        return;
      }
      if (event.altKey && event.key.toLowerCase() === "e") {
        event.preventDefault();
        openWindow("explorer");
        return;
      }
      if (event.altKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        showDesktop();
        return;
      }
      if (event.altKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        lock();
        return;
      }
      if (event.altKey && event.key.toLowerCase() === "i") {
        event.preventDefault();
        openWindow("sys");
        return;
      }
      if (event.ctrlKey && event.shiftKey && event.key === "Escape") {
        event.preventDefault();
        setTasksOpen(true);
        return;
      }
      if (!event.altKey || !front) return;
      const arrow: Record<string, SnapMode> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "max", ArrowDown: "free" };
      const mode = arrow[event.key];
      if (!mode) return;
      event.preventDefault();
      if (mode === "free") {
        if (front.max || front.snap !== "free") toggleMax(front.id);
        return;
      }
      const { width, height } = stageSize();
      const frame = snapFrame(width, height, mode);
      placeWindow(front.id, frame.x, frame.y, frame.w, frame.h, mode);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, focusWindow, closeWindow, placeWindow, toggleMax, openWindow, showDesktop, lock]);

  useEffect(() => {
    if (!switchId) return;
    const id = window.setTimeout(() => setSwitchId(null), 1200);
    return () => window.clearTimeout(id);
  }, [switchId]);

  const apps = ICONS.filter((item) => `${item.label} ${NAMES[item.kind]}`.toLowerCase().includes(query.trim().toLowerCase()));
  const fileHits = Object.keys(files)
    .filter((path) => query.trim() && path.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 5);

  const launchRun = () => {
    const text = runText.trim();
    if (!text) return;
    const hit = ICONS.find((item) => text.toLowerCase() === item.label.toLowerCase() || text.toLowerCase() === `${item.label.toLowerCase()}.exe` || text === NAMES[item.kind]);
    if (hit) openWindow(hit.kind);
    else {
      openWindow("term");
      submit(text);
    }
    pushNote(hit ? `${NAMES[hit.kind]} を開きました` : `実行: ${text}`);
    setRunText("");
    setRunOpen(false);
  };
  const frontId = windows.reduce<string | null>((best, win) => {
    if (win.min) return best;
    if (!best) return win.id;
    const current = windows.find((item) => item.id === best);
    return !current || win.z > current.z ? win.id : best;
  }, null);

  return (
    <div className="fox-root">
      <header className="fox-top">
        <div className="fox-brand">
          <FoxMark />
          FOX OS
        </div>
        <div className="fox-meta">
          <span className="fox-link">
            <strong>{clock}</strong>
          </span>
          <button type="button" className="fox-btn" onClick={termVisual === "closed" ? openTerm : closeTerm}>
            {termVisual === "closed" ? "ターミナル展開" : "ターミナル消去"}
          </button>
          <button
            type="button"
            className="fox-btn"
            onClick={() => {
              armBootSound();
              replayBoot();
            }}
          >
            再初期化
          </button>
        </div>
      </header>
      <div
        className="fox-stage fox-desk"
        style={{ filter: `brightness(${bright}%)` }}
        onContextMenu={(event) => {
          if ((event.target as HTMLElement).closest(".fox-window, .fox-apps, button, input, textarea")) return;
          event.preventDefault();
          setStartOpen(false);
          setCalendar(false);
          setMenu({ x: event.clientX, y: event.clientY });
        }}
        onPointerDown={() => {
          setMenu(null);
          setTaskMenu(null);
        }}
      >
        <DeskIcons />
        {phase === "desktop" ? <DeskWindows /> : null}
      </div>
      <nav className="fox-dock" aria-label="タスクバー">
        <button
          type="button"
          className={`fox-start${startOpen ? " is-on" : ""}`}
          aria-expanded={startOpen}
          onClick={() => {
            setStartOpen((open) => !open);
            setCalendar(false);
            setMenu(null);
          }}
        >
          <FoxMark />
          <span>スタート</span>
        </button>
        <div className="fox-task-wins">
          {windows.map((win) => (
            <button
              key={win.id}
              type="button"
              className={`fox-task-ico${win.id === frontId ? " is-on" : ""}${win.min ? " is-min" : ""}`}
              onClick={() => {
                if (win.min || win.id !== frontId) focusWindow(win.id);
                else toggleMin(win.id);
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                setTaskMenu({ id: win.id, x: event.clientX, y: event.clientY });
              }}
            >
              <FoxMark />
              <span>{win.title}</span>
            </button>
          ))}
        </div>
        <div className="fox-task-tray">
          <button
            type="button"
            className={`fox-task-ico fox-ime${ime !== "direct" ? " is-on" : ""}`}
            aria-label="IME"
            aria-pressed={ime !== "direct"}
            title={
              ime === "hira"
                ? "ひらがな。次はカタカナ"
                : ime === "kata"
                  ? "カタカナ。次は漢字"
                  : ime === "kanji"
                    ? "漢字。スペースで候補。次は英数"
                    : imeTaps === 0
                      ? "3回押すとひらがな。その後 あ → ア → 漢"
                      : `あと${3 - imeTaps}回でひらがな`
            }
            onClick={tapIme}
          >
            <FoxMark />
            <span>{ime === "hira" ? "あ" : ime === "kata" ? "ア" : ime === "kanji" ? "漢" : imeTaps > 0 ? String(imeTaps) : "A"}</span>
          </button>
          <label className="fox-vol">
            <FoxMark />
            <span>VOL</span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              aria-label="音量"
              onChange={(event) => setVolume(Number(event.target.value))}
            />
          </label>
          <button type="button" className="fox-task-ico" aria-label="クイック設定" onClick={() => setQuickOpen((open) => !open)}>
            <span>SET</span>
          </button>
          <button type="button" className="fox-task-ico" aria-label="通知" onClick={() => setNotesOpen((open) => !open)}>
            <span>通知{notes.length ? notes.length : ""}</span>
          </button>
          <button
            type="button"
            className="fox-clock-btn"
            onClick={() => {
              setCalendar((open) => !open);
              setStartOpen(false);
            }}
          >
            {clock}
          </button>
          <button type="button" className="fox-show-desk" aria-label="デスクトップを表示" onClick={showDesktop} />
        </div>
      </nav>
      {startOpen ? (
        <section className="fox-start-menu" aria-label="スタートメニュー">
          <input
            value={query}
            placeholder="ソフトを検索"
            aria-label="ソフトを検索"
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="fox-start-apps">
            {apps.map((item) => (
              <button
                key={item.kind}
                type="button"
                onClick={() => {
                  openWindow(item.kind);
                  setStartOpen(false);
                  setQuery("");
                }}
              >
                <FoxMark />
                <span>
                  {NAMES[item.kind]}
                  <small>{item.label}</small>
                </span>
              </button>
            ))}
            {fileHits.map((path) => (
              <button
                key={path}
                type="button"
                onClick={() => {
                  openWindow("explorer");
                  setStartOpen(false);
                }}
              >
                <span>
                  {path.split("/").pop()}
                  <small>{path}</small>
                </span>
              </button>
            ))}
          </div>
          <p className="fox-note">Alt+R 実行 / Alt+E フォルダ / Alt+D デスクトップ / Alt+L ロック / Ctrl+Shift+Esc タスク</p>
          <div className="fox-start-power" role="group" aria-label="電源">
            <button type="button" onClick={lock}>
              ロック
            </button>
            <button type="button" onClick={sleep}>
              スリープ
            </button>
            <button type="button" onClick={shutdown}>
              シャットダウン
            </button>
          </div>
        </section>
      ) : null}
      {runOpen ? (
        <form
          className="fox-run"
          onSubmit={(event) => {
            event.preventDefault();
            launchRun();
          }}
        >
          <label>
            ファイル名を指定して実行
            <input value={runText} autoFocus aria-label="実行する名前" onChange={(event) => setRunText(event.target.value)} />
          </label>
          <button type="submit" className="fox-btn">
            実行
          </button>
        </form>
      ) : null}
      {tasksOpen ? (
        <section className="fox-tasks" aria-label="タスクマネージャー">
          <header>
            <span>タスク</span>
            <button type="button" onClick={() => setTasksOpen(false)}>
              閉じる
            </button>
          </header>
          {windows.length === 0 ? <p className="fox-note">開いているウィンドウはありません</p> : null}
          {windows.map((win) => (
            <div key={win.id} className="fox-task-row">
              <span>
                {win.title}
                {win.min ? "（最小化）" : ""}
                {win.pinned ? "（最前面）" : ""}
              </span>
              <button type="button" onClick={() => closeWindow(win.id)}>
                終了
              </button>
            </div>
          ))}
        </section>
      ) : null}
      {quickOpen ? (
        <section className="fox-quick" aria-label="クイック設定">
          <button type="button" onClick={() => setOnline((value) => !value)}>
            回線 {online ? "ON" : "OFF"}
          </button>
          <label>
            音量 {volume}
            <input type="range" min={0} max={100} value={volume} aria-label="音量" onChange={(event) => setVolume(Number(event.target.value))} />
          </label>
          <label>
            明るさ {bright}
            <input type="range" min={40} max={100} value={bright} aria-label="明るさ" onChange={(event) => setBright(Number(event.target.value))} />
          </label>
          <button type="button" onClick={() => setTasksOpen(true)}>
            タスクマネージャー
          </button>
          <button type="button" onClick={() => setRunOpen(true)}>
            ファイル名を指定して実行
          </button>
        </section>
      ) : null}
      {notesOpen ? (
        <section className="fox-notes" aria-label="通知">
          {notes.length === 0 ? <p className="fox-note">通知はありません</p> : null}
          {notes.map((note) => (
            <button key={note.id} type="button" onClick={() => dismissNote(note.id)}>
              {note.text}
            </button>
          ))}
        </section>
      ) : null}
      {assist ? (
        <section className="fox-assist" aria-label="スナップ補助">
          <p>もう半分に置くウィンドウ</p>
          {windows
            .filter((win) => win.id !== assist.id)
            .map((win) => (
              <button
                key={win.id}
                type="button"
                onClick={() => {
                  const { width, height } = stageSize();
                  const frame = snapFrame(width, height, assist.side === "left" ? "right" : "left");
                  placeWindow(win.id, frame.x, frame.y, frame.w, frame.h, assist.side === "left" ? "right" : "left");
                  setAssist(null);
                }}
              >
                {win.title}
              </button>
            ))}
          <button type="button" onClick={() => setAssist(null)}>
            閉じる
          </button>
        </section>
      ) : null}
      {calendar ? (
        <div className="fox-calendar" role="dialog" aria-label="日付">
          <strong>{dateLabel}</strong>
          <span>{clock}</span>
        </div>
      ) : null}
      {menu ? (
        <div className="fox-context" style={{ left: menu.x, top: menu.y }} role="menu">
          <button
            type="button"
            onClick={() => {
              openWindow("term");
              setMenu(null);
            }}
          >
            ターミナル
          </button>
          <button
            type="button"
            onClick={() => {
              openWindow("explorer");
              setMenu(null);
            }}
          >
            エクスプローラ
          </button>
          <button
            type="button"
            onClick={() => {
              showDesktop();
              setMenu(null);
            }}
          >
            デスクトップを表示
          </button>
          <button
            type="button"
            onClick={() => {
              arrangeIcons();
              setMenu(null);
            }}
          >
            アイコンを整列
          </button>
          <button
            type="button"
            onClick={() => {
              cascadeWindows();
              setMenu(null);
            }}
          >
            ウィンドウを重ねて表示
          </button>
          <button
            type="button"
            onClick={() => {
              tileWindows();
              setMenu(null);
            }}
          >
            ウィンドウを並べて表示
          </button>
        </div>
      ) : null}
      {taskMenu ? (
        <div className="fox-context" style={{ left: taskMenu.x, top: taskMenu.y }} role="menu">
          <button
            type="button"
            onClick={() => {
              focusWindow(taskMenu.id);
              setTaskMenu(null);
            }}
          >
            開く
          </button>
          <button
            type="button"
            onClick={() => {
              closeWindow(taskMenu.id);
              setTaskMenu(null);
            }}
          >
            閉じる
          </button>
        </div>
      ) : null}
      {switchId ? (
        <div className="fox-switcher" role="status">
          {windows.map((win) => (
            <button key={win.id} type="button" className={win.id === switchId ? "is-on" : ""} onClick={() => focusWindow(win.id)}>
              {win.title}
            </button>
          ))}
          <span>Alt+Tab</span>
        </div>
      ) : null}
      {phase === "sleep" ? (
        <button type="button" className="fox-power-screen" onClick={wake}>
          スリープ中
          <span>クリックで復帰</span>
        </button>
      ) : null}
      {phase === "off" ? (
        <div className="fox-power-screen is-off">
          <p>シャットダウンしました</p>
          <button type="button" className="fox-btn" onClick={powerOn}>
            起動
          </button>
        </div>
      ) : null}
      {phase === "boot" ? <BootOverlay /> : null}
      {phase === "login" ? <LoginScreen /> : null}
    </div>
  );
}
