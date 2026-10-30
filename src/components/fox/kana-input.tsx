import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { commitKana, pushKana } from "@/lib/fox/kana";
import { candidates, toKata } from "@/lib/fox/kanji";
import { convertLast, polish } from "@/lib/fox/phrases";
import { useFox } from "@/lib/fox/store";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onValue: (value: string) => void;
};

export const KanaInput = forwardRef<HTMLInputElement, Props>(function KanaInput(
  { value, onValue, onKeyDown, ...rest },
  ref,
) {
  const ime = useFox((s) => s.ime);
  const pending = useRef("");
  const reading = useRef("");
  const valueRef = useRef(value);
  const onValueRef = useRef(onValue);
  const inner = useRef<HTMLInputElement>(null);
  const ownWrite = useRef(false);
  const [, bump] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [pick, setPick] = useState(0);
  const [hint, setHint] = useState("");
  const latin = useRef("");

  valueRef.current = value;
  onValueRef.current = onValue;
  const japanese = ime === "hira" || ime === "kata" || ime === "kanji";

  const clearCompose = () => {
    pending.current = "";
    reading.current = "";
    setPicks([]);
    setPick(0);
  };

  useEffect(() => {
    if (ownWrite.current) {
      ownWrite.current = false;
      return;
    }
    if (!pending.current && !reading.current && picks.length === 0) return;
    clearCompose();
    bump((n) => n + 1);
  }, [value]);

  useEffect(() => {
    if (japanese) return;
    const leftover = reading.current + commitKana(pending.current);
    clearCompose();
    if (!leftover) return;
    const next = valueRef.current + leftover;
    if (next !== valueRef.current) onValueRef.current(next);
    else bump((n) => n + 1);
  }, [ime]);

  const emit = (text: string) => {
    const next = valueRef.current + text;
    ownWrite.current = true;
    onValue(next);
  };

  const commitSelection = (index = pick) => {
    const chosen = picks[index] ?? reading.current + commitKana(pending.current);
    clearCompose();
    if (chosen) emit(chosen);
    else bump((n) => n + 1);
  };

  useEffect(() => {
    const form = inner.current?.form;
    if (!form) return;
    const flush = () => {
      const chosen = picks.length ? picks[pick] : reading.current + commitKana(pending.current);
      if (!chosen && !pending.current) return;
      clearCompose();
      const next = valueRef.current + (chosen || commitKana(pending.current));
      if (inner.current) inner.current.value = next;
      if (next !== valueRef.current) onValueRef.current(next);
    };
    form.addEventListener("submit", flush, true);
    return () => form.removeEventListener("submit", flush, true);
  });

  const preview = picks.length ? picks[pick] : reading.current + pending.current;
  const shown = japanese ? value + preview : value;

  const setNode = (node: HTMLInputElement | null) => {
    inner.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const writeLive = (kana: string, restBuffer: string) => {
    const piece = ime === "kata" ? toKata(kana) : kana;
    if (ime === "kanji") {
      reading.current += piece;
      pending.current = restBuffer;
      setPicks([]);
      bump((n) => n + 1);
      return;
    }
    pending.current = restBuffer;
    if (piece) emit(piece);
    else bump((n) => n + 1);
  };

  const openPicks = () => {
    const text = reading.current + commitKana(pending.current);
    pending.current = "";
    reading.current = text;
    if (!text) return false;
    const list = candidates(text);
    setPicks(list.length ? list : [text]);
    setPick(0);
    return true;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!japanese || event.nativeEvent.isComposing || event.metaKey || event.ctrlKey || event.altKey) {
      if (event.key === " " && !event.ctrlKey) {
        const hit = convertLast(value);
        if (hit) {
          event.preventDefault();
          onValue(hit.text);
          setHint(hit.how);
          return;
        }
      }
      if (event.key === "Enter") {
        const fixed = polish(value);
        if (fixed !== value) {
          event.preventDefault();
          onValue(fixed);
          setHint("文法を直しました。もう一度 Enter");
          return;
        }
      }
      onKeyDown?.(event);
      return;
    }
    const el = event.currentTarget;
    const atEnd = el.selectionStart === shown.length && el.selectionEnd === shown.length;
    if (!atEnd && event.key !== "Enter") {
      clearCompose();
      onKeyDown?.(event);
      return;
    }
    if (picks.length && /^[1-9]$/.test(event.key)) {
      const index = Number(event.key) - 1;
      if (index < picks.length) {
        event.preventDefault();
        commitSelection(index);
        return;
      }
    }
    if (picks.length && (event.key === "ArrowDown" || event.key === "ArrowRight")) {
      event.preventDefault();
      setPick((index) => (index + 1) % picks.length);
      return;
    }
    if (picks.length && (event.key === "ArrowUp" || event.key === "ArrowLeft")) {
      event.preventDefault();
      setPick((index) => (index - 1 + picks.length) % picks.length);
      return;
    }
    if (event.key === "Backspace") {
      if (picks.length) {
        event.preventDefault();
        setPicks([]);
        return;
      }
      if (pending.current) {
        event.preventDefault();
        pending.current = pending.current.slice(0, -1);
        bump((n) => n + 1);
        return;
      }
      if (reading.current) {
        event.preventDefault();
        reading.current = [...reading.current].slice(0, -1).join("");
        bump((n) => n + 1);
        return;
      }
      onKeyDown?.(event);
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      if (picks.length || reading.current || pending.current) commitSelection();
      onKeyDown?.(event);
      return;
    }
    if (event.key === " ") {
      event.preventDefault();
      if (ime === "kanji") {
        if (picks.length) setPick((index) => (index + 1) % picks.length);
        else if (!openPicks()) emit(" ");
        return;
      }
      const rest = commitKana(pending.current);
      pending.current = "";
      if (rest) emit(ime === "kata" ? toKata(rest) : rest);
      else emit(" ");
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (picks.length) setPicks([]);
      else clearCompose();
      bump((n) => n + 1);
      return;
    }
    if (event.key.length === 1) {
      event.preventDefault();
      if (picks.length) commitSelection();
      const ch = /[a-zA-Z]/.test(event.key) ? event.key.toLowerCase() : event.key;
      if (/[a-z]/.test(ch)) latin.current += ch;
      const step = pushKana(pending.current, ch);
      writeLive(step.text, step.buffer);
      if (latin.current) setHint(`打ち方 ${latin.current}`);
      return;
    }
    onKeyDown?.(event);
  };

  return (
    <span className="fox-ime-field">
      <input
        {...rest}
        ref={setNode}
        value={shown}
        onChange={(event) => {
          if (!japanese) {
            onValue(event.target.value);
            return;
          }
          if (event.target.value === shown) return;
          clearCompose();
          onValue(event.target.value);
        }}
        onKeyDown={handleKeyDown}
      />
      {hint ? <span className="fox-ime-hint">{hint}</span> : null}
      {picks.length ? (
        <span className="fox-ime-picks" role="listbox" aria-label="変換候補">
          {picks.map((item, index) => (
            <button
              key={`${item}-${index}`}
              type="button"
              role="option"
              aria-selected={index === pick}
              className={index === pick ? "is-on" : ""}
              onMouseDown={(event) => {
                event.preventDefault();
                commitSelection(index);
              }}
            >
              {index + 1} {item}
            </button>
          ))}
        </span>
      ) : null}
    </span>
  );
});
