import { useState } from "react";
import { previewBody } from "@/lib/fox/model";
import { useFox } from "@/lib/fox/store";

export function BrowserWindow() {
  const body = useFox((s) => previewBody(s));
  const [address, setAddress] = useState("fox://home");
  const [url, setUrl] = useState("fox://home");

  return (
    <div className="fox-web">
      <form
        className="fox-ai-form"
        onSubmit={(event) => {
          event.preventDefault();
          setUrl(address.trim() || "fox://home");
        }}
      >
        <input value={address} aria-label="アドレス" onChange={(event) => setAddress(event.target.value)} />
        <button type="submit" className="fox-btn">
          開く
        </button>
      </form>
      {url === "fox://preview" ? (
        <pre>{body}</pre>
      ) : url === "fox://home" || url === "" ? (
        <div className="fox-web-home">
          <p>FOX ブラウザ</p>
          <button type="button" className="fox-btn" onClick={() => { setAddress("fox://preview"); setUrl("fox://preview"); }}>
            fox://preview
          </button>
          <button
            type="button"
            className="fox-btn"
            onClick={() => {
              setAddress("https://github.com/ubi-chain/fox-os");
              setUrl("https://github.com/ubi-chain/fox-os");
            }}
          >
            GitHub
          </button>
        </div>
      ) : (
        <iframe title={url} src={url} />
      )}
    </div>
  );
}
