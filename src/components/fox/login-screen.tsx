import { useState } from "react";
import { useFox } from "@/lib/fox/store";
import { FoxMark } from "./fox-mark";

export function LoginScreen() {
  const signIn = useFox((s) => s.signIn);
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
      }}
    >
      <FoxMark />
      <h1>FOX OS</h1>
      <label>
        ID
        <input value={id} autoComplete="username" onChange={(event) => setId(event.target.value)} />
      </label>
      <label>
        パスワード
        <input
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
