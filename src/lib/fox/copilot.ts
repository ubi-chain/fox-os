export type BuildFile = { path: string; body: string };

export type BuildPlan = {
  summary: string;
  files: BuildFile[];
  note: string;
};

export function planBuild(prompt: string, project = "/home/fox/sample_app"): BuildPlan {
  const title = prompt.trim().slice(0, 40) || "メモ";
  return {
    summary: `${title} のメモを ${project} に足します。`,
    note: "外部には送っていません。この机の中だけで組み立てます。承認するまでファイルは書きません。",
    files: [
      {
        path: `${project}/notes.txt`,
        body: `${title}\n${new Date().toISOString()}\n`,
      },
    ],
  };
}
