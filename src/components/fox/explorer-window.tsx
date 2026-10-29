import { useEffect, useState } from "react";
import { useFox } from "@/lib/fox/store";

function entries(files: Record<string, string>, dir: string) {
  const prefix = dir === "/" ? "/" : `${dir}/`;
  const names = new Map<string, "dir" | "file">();
  for (const path of Object.keys(files)) {
    if (dir !== "/" && !path.startsWith(prefix)) continue;
    if (dir === "/" && !path.startsWith("/")) continue;
    const rest = dir === "/" ? path.slice(1) : path.slice(prefix.length);
    const [head, ...more] = rest.split("/");
    if (!head || head === ".keep") continue;
    const kind = more.length > 0 ? "dir" : "file";
    const prev = names.get(head);
    names.set(head, prev === "dir" || kind === "dir" ? "dir" : "file");
  }
  return [...names.entries()].sort((a, b) => Number(b[1] === "dir") - Number(a[1] === "dir") || a[0].localeCompare(b[0]));
}

export function ExplorerWindow() {
  const files = useFox((s) => s.files);
  const trash = useFox((s) => s.trash);
  const makeEntry = useFox((s) => s.makeEntry);
  const trashPaths = useFox((s) => s.trashPaths);
  const restoreTrash = useFox((s) => s.restoreTrash);
  const emptyTrash = useFox((s) => s.emptyTrash);
  const pushNote = useFox((s) => s.pushNote);
  const explorerBin = useFox((s) => s.explorerBin);
  const setExplorerBin = useFox((s) => s.setExplorerBin);
  const [left, setLeft] = useState("/home/fox");
  const [right, setRight] = useState("/");
  const [pick, setPick] = useState<{ side: "L" | "R"; path: string } | null>(null);
  const [name, setName] = useState("");
  const [bin, setBin] = useState(false);

  useEffect(() => {
    setBin(explorerBin);
  }, [explorerBin]);

  const create = (folder: boolean) => {
    const clean = name.trim().replace(/[\\]/g, "");
    if (!clean || clean.includes("..")) return;
    const next = left === "/" ? `/${clean}` : `${left}/${clean}`;
    if (folder) makeEntry(`${next}/.keep`, "");
    else makeEntry(next, "");
    pushNote(`${clean} を作りました`);
    setName("");
  };

  const copyAcross = () => {
    if (!pick || files[pick.path] === undefined) return;
    const base = pick.path.slice(pick.path.lastIndexOf("/") + 1);
    const destDir = pick.side === "L" ? right : left;
    const dest = destDir === "/" ? `/${base}` : `${destDir}/${base}`;
    makeEntry(dest, files[pick.path]);
    pushNote(`${base} を反対側へコピーしました`);
  };

  const pane = (side: "L" | "R", dir: string, setDir: (next: string) => void) => {
    const rows = entries(files, dir);
    return (
      <div className="fox-pane">
        <p className="fox-note">{side === "L" ? "左" : "右"} {dir}</p>
        <div className="fox-tree">
          {dir !== "/" ? (
            <button type="button" onClick={() => setDir(dir.slice(0, dir.lastIndexOf("/")) || "/")}>
              ../
            </button>
          ) : null}
          {rows.map(([entry, kind]) => {
            const next = dir === "/" ? `/${entry}` : `${dir}/${entry}`;
            return (
              <span key={entry} className="fox-exp-row">
                <button
                  type="button"
                  className={pick?.path === next ? "is-on" : ""}
                  onClick={() => {
                    if (kind === "dir") {
                      setDir(next);
                      setPick(null);
                      return;
                    }
                    setPick({ side, path: next });
                  }}
                >
                  {kind === "dir" ? `${entry}/` : entry}
                </button>
                <button type="button" aria-label={`${entry}を削除`} onClick={() => trashPaths(next)}>
                  削除
                </button>
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fox-explorer">
      <div className="fox-exp-bar">
        <button
          type="button"
          onClick={() => {
            setBin(false);
            setExplorerBin(false);
          }}
        >
          ファイル
        </button>
        <button
          type="button"
          onClick={() => {
            setBin(true);
            setExplorerBin(true);
          }}
        >
          ごみ箱 {trash.length}
        </button>
      </div>
      {bin ? (
        <div className="fox-tree">
          {trash.length === 0 ? <p className="fox-note">ごみ箱は空です</p> : null}
          {trash.map((item) => (
            <button key={item.path} type="button" onClick={() => restoreTrash(item.path)}>
              戻す {item.path}
            </button>
          ))}
          {trash.length ? (
            <button type="button" onClick={emptyTrash}>
              空にする
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <form
            className="fox-exp-bar"
            onSubmit={(event) => {
              event.preventDefault();
              create(false);
            }}
          >
            <input value={name} aria-label="新しい名前" placeholder="左に作る名前" onChange={(event) => setName(event.target.value)} />
            <button type="submit">ファイル</button>
            <button type="button" onClick={() => create(true)}>
              フォルダ
            </button>
            <button type="button" onClick={copyAcross}>
              反対側へコピー
            </button>
          </form>
        <div className="fox-panes">
          {pane("L", left, setLeft)}
          {pane("R", right, setRight)}
        </div>
        {pick && files[pick.path] !== undefined ? <pre>{files[pick.path]}</pre> : null}
        </>
      )}
    </div>
  );
}
