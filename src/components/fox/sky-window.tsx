import { useState } from "react";
import { useFox } from "@/lib/fox/store";

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export function GuardSite({ publicPage = false }: { publicPage?: boolean }) {
  const [note, setNote] = useState("Grok Bot がこのページを見ています。");
  const [safe, setSafe] = useState(true);
  return (
    <div className="fox-phone">
      <header>
        <b>Fox Guard</b>
        <span>{publicPage ? "スマホ用スキャナー" : "スマホ用 · この机の中"}</span>
      </header>
      <div className="fox-bot">
        <img src="/favicon.svg" alt="" />
        <p>ぼくは Grok Bot。まもりページの番をしてるよ。実機のファイルは読まないよ。</p>
      </div>
      <p className={safe ? "fox-ok" : ""}>{safe ? "状態: 安全" : "状態: 確認中"}</p>
      <button
        type="button"
        onClick={() => {
          setSafe(false);
          setNote("スキャン中…");
          window.setTimeout(() => {
            setSafe(true);
            setNote("スキャン完了。あやしいものは無かったよ。");
          }, 700);
        }}
      >
        スキャン
      </button>
      <p>{note}</p>
    </div>
  );
}

export function SkyWindow() {
  const inbox = useFox((s) => s.skyInbox);
  const guardOn = useFox((s) => s.guardOn);
  const openWindow = useFox((s) => s.openWindow);
  const [tab, setTab] = useState<"call" | "sms" | "guard">("call");
  const [dial, setDial] = useState("");
  const [call, setCall] = useState<"idle" | "ring" | "talk">("idle");
  const [bot, setBot] = useState("FoxSky は机の中の電話です。外の番号にはつなぎません。");

  const start = () => {
    if (!dial.trim()) return;
    setCall("ring");
    setBot("呼び出しています…");
    window.setTimeout(() => {
      setCall("talk");
      setBot(`Grok Bot です。${dial} には実回線でつながっていません。まもりページの案内ができます。`);
    }, 900);
  };

  return (
    <div className="fox-phone">
      <header>
        <b>FoxSky</b>
        <span>{guardOn ? "まもり導入済み" : "IP電話 · 模擬"}</span>
      </header>
      <div className="fox-phone-tabs">
        <button type="button" className={tab === "call" ? "is-on" : ""} onClick={() => setTab("call")}>
          通話
        </button>
        <button type="button" className={tab === "sms" ? "is-on" : ""} onClick={() => setTab("sms")}>
          SMS
        </button>
        <button type="button" className={tab === "guard" ? "is-on" : ""} onClick={() => setTab("guard")}>
          まもり
        </button>
      </div>
      {tab === "guard" ? (
        <GuardSite />
      ) : tab === "sms" ? (
        <ul className="fox-sms">
          {inbox.length === 0 ? <li>まだありません。ターミナルで /sms foxsky to 電話番号</li> : null}
          {inbox.map((item) => (
            <li key={item.id}>
              <b>to {item.to}</b>
              <p>{item.text}</p>
              <button type="button" onClick={() => openWindow("guard")}>
                リンクを開く
              </button>
              <button
                type="button"
                onClick={() => {
                  const digits = item.to.replace(/[^\d+]/g, "");
                  window.location.href = `sms:${digits}?body=${encodeURIComponent(item.text)}`;
                }}
              >
                実電話へ送る
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <p className="fox-dial">{dial || "番号"}</p>
          <div className="fox-pad">
            {keys.map((key) => (
              <button key={key} type="button" onClick={() => setDial((value) => (value + key).slice(0, 16))}>
                {key}
              </button>
            ))}
          </div>
          <div className="fox-phone-tabs">
            <button type="button" onClick={() => setDial("")}>
              消す
            </button>
            <button type="button" onClick={start} disabled={call !== "idle"}>
              発信
            </button>
            <button
              type="button"
              onClick={() => {
                setCall("idle");
                setBot("通話を切りました。");
              }}
            >
              切る
            </button>
          </div>
          <p>{call === "talk" ? "通話中 · Grok Bot" : call === "ring" ? "呼び出し中" : "待ち受け"}</p>
          <p>{bot}</p>
        </>
      )}
    </div>
  );
}
