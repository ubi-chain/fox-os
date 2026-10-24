import { useFox } from "@/lib/fox/store";

export function SlackPanel({ embedded = false }: { embedded?: boolean }) {
  const open = useFox((s) => s.slackOpen);
  const channel = useFox((s) => s.slackChannel);
  const rooms = useFox((s) => s.slackRooms);
  const draft = useFox((s) => s.slackDraft);
  const closeSlack = useFox((s) => s.closeSlack);
  const setChannel = useFox((s) => s.setSlackChannel);
  const setDraft = useFox((s) => s.setSlackDraft);
  const send = useFox((s) => s.sendSlack);
  if (!open && !embedded) return null;
  const messages = rooms[channel] ?? [];

  return (
    <div className={embedded ? "fox-slack is-embedded" : "fox-slack"} role="dialog" aria-label="チャット">
      <aside>
        <p>FOX CHAT</p>
        {(["general", "dev"] as const).map((id) => (
          <button key={id} type="button" className={channel === id ? "is-on" : ""} onClick={() => setChannel(id)}>
            #{id}
          </button>
        ))}
        {embedded ? null : (
          <button type="button" onClick={closeSlack}>
            閉じる
          </button>
        )}
      </aside>
      <section>
        <header className="fox-panel-h">
          <span>#{channel}</span>
          <span>LOCAL</span>
        </header>
        <div className="fox-slack-log">
          {messages.map((message, index) => (
            <p key={`${message.who}-${index}`}>
              <b>{message.who}</b> {message.text}
            </p>
          ))}
        </div>
        <form
          className="fox-ai-form"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <input
            value={draft}
            aria-label="メッセージ"
            placeholder="メッセージ"
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" className="fox-btn fox-btn-accent">
            送信
          </button>
        </form>
      </section>
    </div>
  );
}
