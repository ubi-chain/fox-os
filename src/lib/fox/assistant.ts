import { projectFrom, type OsState, type Proposal } from "./model";

export type AssistReply = { text: string; proposal?: Proposal };

function proposal(
  state: OsState,
  command: string,
  effect: string,
  destructive: boolean,
): Proposal {
  const cwd = projectFrom(state.cwd, state.files, state.project) ?? state.cwd;
  return {
    command,
    cwd,
    effect,
    permission: destructive ? "ワークスペース内の破壊的操作" : "ワークスペース内の読み取りまたは起動",
    destructive,
  };
}

export function assist(question: string, state: OsState): AssistReply {
  const q = question.trim();
  const lower = q.toLowerCase();
  if (!q) return { text: "聞きたいことを書いてください。コードは自動では実行しません。" };

  if (/apt|yum|dnf|rpm|dpkg|パッケージ|install/.test(lower)) {
    return {
      text: "パッケージはワークスペース内の模擬です。apt install 名前、yum install 名前、dnf install 名前、rpm -ivh 名前.rpm、dpkg -i 名前.deb が使えます。実機のリポジトリには出ません。",
      proposal: proposal(state, "apt list", "入っているパッケージを表示する", false),
    };
  }

  if (/linux|コマンド|シェル|ubuntu/.test(lower)) {
    return {
      text: "この画面のシェルは FOX OS のワークスペースです。ls、cd、cat、apt、yum、dnf、rpm、dpkg が使えます。実機のカーネルではありません。help で一覧が出ます。",
      proposal: proposal(state, "help", "使えるコマンドを表示する", false),
    };
  }

  if (/git|ブランチ/.test(lower)) {
    return {
      text: "いまのブランチと、未コミットの変更があるかは git status で分かります。表示はワークスペースの記録です。",
      proposal: proposal(state, "git status", "ブランチと変更状態を表示する", false),
    };
  }

  if (/ファイル|メモ|note/.test(lower)) {
    return {
      text: "作業用のメモは sample_app/notes.txt にあります。cat で読めます。copilot に頼むと、承認したあとだけファイルを書きます。",
      proposal: proposal(state, "cat sample_app/notes.txt", "メモを表示する", false),
    };
  }

  return {
    text: "FOX OS の範囲で答えます。ファイル操作、パッケージ導入、辞典、ウィンドウ操作を聞けます。コマンドが必要なら、実行前に内容を出して承認を待ちます。",
  };
}
