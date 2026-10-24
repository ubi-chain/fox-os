import { useState } from "react";
import { useFox } from "@/lib/fox/store";

function entries(files: Record<string, string>, dir: string) {
  const prefix = dir === "/" ? "/" : `${dir}/`;
  const names = new Map<string, "dir" | "file">();
  for (const path of Object.keys(files)) {
    if (dir !== "/" && !path.startsWith(prefix)) continue;
    if (dir === "/" && !path.startsWith("/")) continue;
    const rest = dir === "/" ? path.slice(1) : path.slice(prefix.length);
    const [head, ...more] = rest.split("/");
    if (!head) continue;
    const kind = more.length > 0 ? "dir" : "file";
    const prev = names.get(head);
    names.set(head, prev === "dir" || kind === "dir" ? "dir" : "file");
  }
  return [...names.entries()].sort((a, b) => Number(b[1] === "dir") - Number(a[1] === "dir") || a[0].localeCompare(b[0]));
}

export function ExplorerWindow() {
  const files = useFox((s) => s.files);
  const [dir, setDir] = useState("/home/fox");
  const [file, setFile] = useState<string | null>(null);
  const rows = entries(files, dir);

  return (
    <div className="fox-explorer">
      <p className="fox-note">{dir}</p>
      <div className="fox-tree">
        {dir !== "/" ? (
          <button type="button" onClick={() => setDir(dir.slice(0, dir.lastIndexOf("/")) || "/")}>
            ../
          </button>
        ) : null}
        {rows.map(([name, kind]) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              const next = dir === "/" ? `/${name}` : `${dir}/${name}`;
              if (kind === "dir") {
                setDir(next);
                setFile(null);
                return;
              }
              setFile(next);
            }}
          >
            {kind === "dir" ? `${name}/` : name}
          </button>
        ))}
      </div>
      {file ? <pre>{files[file] ?? ""}</pre> : null}
    </div>
  );
}
