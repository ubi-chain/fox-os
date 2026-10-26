import { useRef, useState } from "react";
import { useFox } from "@/lib/fox/store";
import { FoxMark } from "./fox-mark";

export function LoginScreen() {
  const signIn = useFox((s) => s.signIn);
  const passRef = useRef<HTMLInputElement>(null);
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  return (
    <form
      className="fox-login"
      onSubmit={(event) => {
        event.preventDefault();
        const ok = signIn(id.trim(), pass);
        setError(!ok);
        if (!ok && !pass) passRef.current?.focus();
      }}
    >
      <FoxMark />
      <h1>FOX OS</h1>
      <label>
        ID
        <input
          value={id}
          autoFocus
          autoComplete="username"
          onChange={(event) => setId(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            passRef.current?.focus();
          }}
        />
      </label>
      <label>
        パスワード
        <input
          ref={passRef}
          type="password"
          value={pass}
          autoComplete="current-password"
          onChange={(event) => setPass(event.target.value)}
        />
      </label>
      {error ? <p>ID またはパスワードが違います</p> : null}
      <button type="submit" className="fox-btn fox-btn-accent">
        ログイン
      </button>
    </form>
  );
}
