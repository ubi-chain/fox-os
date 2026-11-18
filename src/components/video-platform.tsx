import { useEffect, useMemo, useRef, useState } from "react";
import "./video-platform.css";

type Video = {
  id: string;
  title: string;
  creator: string;
  language: string;
  category: string;
  views: string;
  duration: string;
  color: string;
};

const VIDEOS: Video[] = [
  { id: "v1", title: "夜明けの東京を歩く", creator: "mori", language: "日本語", category: "旅行", views: "12.4K", duration: "08:42", color: "#773a43" },
  { id: "v2", title: "A tiny film about rainy days", creator: "noahfilms", language: "English", category: "Film", views: "8.1K", duration: "04:18", color: "#28566a" },
  { id: "v3", title: "Cocina fácil: pan casero", creator: "luzcocina", language: "Español", category: "料理", views: "22K", duration: "11:03", color: "#796136" },
  { id: "v4", title: "서울의 작은 책방들", creator: "hana", language: "한국어", category: "文化", views: "5.7K", duration: "06:27", color: "#415c48" },
];

const COPY = {
  ja: { title: "Nami Video", subtitle: "世界の動画に、みんなのコメントを。", search: "動画を検索", all: "おすすめ", play: "再生", comments: "コメント", send: "コメントする", upload: "動画を選んでローカルプレビュー", local: "選んだ動画はこのブラウザー内だけでプレビューされます。サーバーへアップロード・公開はされません。", note: "プロトタイプ · デモデータ", language: "表示言語" },
  en: { title: "Nami Video", subtitle: "Watch together. Comment across the screen.", search: "Search videos", all: "For you", play: "Play", comments: "Comments", send: "Post comment", upload: "Choose a video for local preview", local: "Your selected video is previewed in this browser only. It is not uploaded or published.", note: "Prototype · demo data", language: "Language" },
  es: { title: "Nami Video", subtitle: "Videos del mundo, comentarios en pantalla.", search: "Buscar videos", all: "Para ti", play: "Reproducir", comments: "Comentarios", send: "Publicar comentario", upload: "Elegir video para vista previa local", local: "El video se previsualiza solo en este navegador. No se sube ni se publica.", note: "Prototipo · datos de demostración", language: "Idioma" },
  ko: { title: "Nami Video", subtitle: "세계의 영상, 화면을 가로지르는 댓글.", search: "동영상 검색", all: "추천", play: "재생", comments: "댓글", send: "댓글 등록", upload: "로컬 미리보기용 동영상 선택", local: "선택한 영상은 이 브라우저에서만 미리 재생됩니다. 업로드되거나 공개되지 않습니다.", note: "프로토타입 · 데모 데이터", language: "언어" },
} as const;

type Locale = keyof typeof COPY;

export function VideoPlatform() {
  const [locale, setLocale] = useState<Locale>("ja");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(VIDEOS[0].id);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Record<string, string[]>>({
    v1: ["この景色すき！", "The colors are lovely.", "字幕ありがとう"],
    v2: ["This feels like a deep breath.", "いい雰囲気！"],
    v3: ["¡Lo intentaré este fin de semana!"],
    v4: ["다음에 꼭 가보고 싶어요."],
  });
  const [commentsOn, setCommentsOn] = useState(true);
  const [localVideoUrl, setLocalVideoUrl] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const text = COPY[locale];
  const selected = VIDEOS.find((video) => video.id === selectedId) ?? VIDEOS[0];
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return VIDEOS;
    return VIDEOS.filter((video) => `${video.title} ${video.creator} ${video.category} ${video.language}`.toLocaleLowerCase().includes(needle));
  }, [query]);
  const visibleComments = comments[selected.id] ?? [];

  useEffect(() => () => {
    if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
  }, [localVideoUrl]);

  const chooseVideo = (video: Video) => {
    setSelectedId(video.id);
    setLocalVideoUrl("");
    setUploadMessage("");
  };

  const addComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const comment = commentText.trim();
    if (!comment) return;
    setComments((current) => ({ ...current, [selected.id]: [...(current[selected.id] ?? []), comment] }));
    setCommentText("");
  };

  return (
    <main className="nami-page">
      <header className="nami-header">
        <a className="nami-brand" href="/video" aria-label="Nami Video home">◉ <span>{text.title}</span></a>
        <p>{text.subtitle}</p>
        <label className="nami-locale">{text.language}
          <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={text.language}>
            <option value="ja">日本語</option><option value="en">English</option><option value="es">Español</option><option value="ko">한국어</option>
          </select>
        </label>
      </header>
      <section className="nami-layout">
        <div className="nami-main">
          <div className="nami-player" style={{ background: selected.color }}>
            {localVideoUrl ? <video ref={videoRef} src={localVideoUrl} controls playsInline aria-label={selected.title} /> : (
              <div className="nami-demo-screen"><span>DEMO PLAYER</span><strong>{selected.title}</strong><small>{selected.duration} · {selected.language}</small></div>
            )}
            {commentsOn && !localVideoUrl ? <div className="nami-overlay" aria-label={text.comments}>{visibleComments.slice(-6).map((comment, index) => <span key={`${comment}-${index}`}>{comment}</span>)}</div> : null}
          </div>
          <div className="nami-video-heading"><div><h1>{selected.title}</h1><p>{selected.creator} · {selected.views} views · {selected.category}</p></div><button type="button" className={commentsOn ? "nami-button is-active" : "nami-button"} aria-pressed={commentsOn} onClick={() => setCommentsOn((value) => !value)}>{text.comments} {commentsOn ? "ON" : "OFF"}</button></div>
          <section className="nami-comments"><h2>{text.comments} <span>{visibleComments.length}</span></h2>
            <form onSubmit={addComment} className="nami-comment-form"><label className="sr-only" htmlFor="nami-comment">{text.comments}</label><input id="nami-comment" value={commentText} maxLength={180} onChange={(event) => setCommentText(event.target.value)} placeholder={text.comments} /><button type="submit" disabled={!commentText.trim()}>{text.send}</button></form>
            <ul>{visibleComments.map((comment, index) => <li key={`${comment}-${index}`}>{comment}</li>)}</ul>
          </section>
          <section className="nami-upload"><h2>{text.upload}</h2><p>{text.local}</p><label className="nami-file">{text.upload}<input type="file" accept="video/*" onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            setLocalVideoUrl((old) => { if (old) URL.revokeObjectURL(old); return file ? URL.createObjectURL(file) : ""; });
            setUploadMessage(file ? `${file.name} — local preview only` : "");
          }} /></label>{uploadMessage ? <p role="status">{uploadMessage}</p> : null}</section>
        </div>
        <aside className="nami-sidebar"><label className="nami-search"><span className="sr-only">{text.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} /></label><h2>{text.all}</h2>
          {filtered.map((video) => <button key={video.id} type="button" className={`nami-card${video.id === selected.id ? " is-selected" : ""}`} onClick={() => chooseVideo(video)}><span className="nami-thumb" style={{ background: video.color }}><span>{video.duration}</span></span><span className="nami-card-copy"><strong>{video.title}</strong><small>{video.creator} · {video.language}</small><small>{video.views} views</small></span></button>)}
          {filtered.length === 0 ? <p>No matching videos.</p> : null}
        </aside>
      </section>
      <footer className="nami-footer">{text.note} · Comments are a local demo; production requires moderation, reporting, and privacy controls.</footer>
    </main>
  );
}
