import { useFox } from "@/lib/fox/store";

export function AiPanel() {
  const chat = useFox((s) => s.chat);
  const chatDraft = useFox((s) => s.chatDraft);
  const setChatDraft = useFox((s) => s.setChatDraft);
  const ask = useFox((s) => s.ask);
  const resolveProposal = useFox((s) => s.resolveProposal);
  const pane = useFox((s) => s.pane);
  const pulse = useFox((s) => s.pulse);

  return (
    <section className={`fox-panel fox-ai${pane === "ai" ? " is-active" : ""}${pulse === "ai" ? " is-launch" : ""}`}>
      <header className="fox-panel-h">
        <span>ASSISTANT</span>
        <span>ONBOARD</span>
      </header>
      <div className="fox-panel-b">
        <div className="fox-chat">
          {chat.map((message, index) => (
            <article key={`${message.role}-${index}`} className={message.role === "user" ? "fox-bubble is-user" : "fox-bubble"}>
              {message.text}
              {message.proposal && !message.resolved ? (
                <div className="fox-proposal">
                  <div>{message.proposal.command}</div>
                  <p>ディレクトリ: {message.proposal.cwd}</p>
                  <p>予想: {message.proposal.effect}</p>
                  <p>権限: {message.proposal.permission}</p>
                  <p>{message.proposal.destructive ? "破壊的な操作です。" : "破壊的な操作ではありません。"}</p>
                  <div className="fox-actions">
                    <button type="button" className="fox-btn fox-btn-accent" onClick={() => resolveProposal(index, "run")}>
                      承認して実行
                    </button>
                    <button type="button" className="fox-btn" onClick={() => resolveProposal(index, "dismiss")}>
                      却下
                    </button>
                  </div>
                </div>
              ) : null}
              {message.resolved ? <p className="fox-note">{message.resolved === "run" ? "実行しました。" : "却下しました。"}</p> : null}
            </article>
          ))}
        </div>
      </div>
      <form
        className="fox-ai-form"
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
      >
        <input
          value={chatDraft}
          aria-label="アシスタントへの質問"
          placeholder="Rails のコントローラーを説明して"
          onChange={(event) => setChatDraft(event.target.value)}
        />
        <button type="submit" className="fox-btn fox-btn-accent">
          送信
        </button>
      </form>
    </section>
  );
}
