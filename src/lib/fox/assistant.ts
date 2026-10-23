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

  if (/drop|削除|消して|rollback|破棄/.test(lower) && /db|データベース|migration|マイグレ/.test(lower)) {
    return {
      text: "データベースの破棄は取り消せません。実行する前に対象ディレクトリと影響を確認してください。承認した場合だけワークスペース内で db:drop を走らせます。",
      proposal: proposal(state, "bin/rails db:drop", "SQLite の開発データベースを破棄する", true),
    };
  }

  if (/コントローラー|controller/.test(lower)) {
    return {
      text: "Rails のコントローラーはリクエストを受け、処理を振り、結果を返します。sample_app の HomeController は index で文字列 FOX OS をそのまま返します。モデルはデータ、ビューは画面、コントローラーはその間です。",
      proposal: proposal(state, "cat app/controllers/home_controller.rb", "コントローラーのソースを表示する", false),
    };
  }

  if (/モデル|model/.test(lower)) {
    return {
      text: "モデルはテーブルと Ruby のクラスを対応させます。生成は bin/rails generate model Post title:string body:text の形です。この段階のワークスペースはジェネレータをまだ持たないので、まずは既存のデータベース設定を見てください。",
      proposal: proposal(state, "cat config/database.yml", "データベース設定を読む（秘密情報は含めていない）", false),
    };
  }

  if (/マイグレ|migration|sql/.test(lower)) {
    return {
      text: "マイグレーションはデータベースの変更手順をファイルに残す仕組みです。実行は bin/rails db:prepare（作成と適用）。取り消す db:rollback は破壊的なので、頼まれたときだけ確認付きで出します。",
      proposal: proposal(state, "bin/rails db:prepare", "SQLite を準備し、マイグレーションを適用する", false),
    };
  }

  if (/テスト|test|rspec/.test(lower)) {
    return {
      text: "テストはサーバーを止める必要はありません。bin/rails test がワークスペース内の結果を返します。失敗したらエラー本文をここに貼ってください。この段階では外部へは送りません。",
      proposal: proposal(state, "bin/rails test", "テストスイートを実行する", false),
    };
  }

  if (/サーバー|server|起動/.test(lower)) {
    return {
      text: "開発サーバーは bin/rails server です。止めるときは bin/rails server --stop。ターミナルを閉じてもプロセスは止めません。ここでの待受は画面上の状態で、実機の 3000 番ポートは開きません。",
      proposal: proposal(state, "bin/rails server", "開発サーバーを起動済みにする", false),
    };
  }

  if (/エラー|error|exception/.test(lower)) {
    return {
      text: "Rails のエラーは下からではなく、一番上の例外名と「どこで起きたか」を見ます。よくあるのは未実行のマイグレーション、タイプミスしたルート、nil へのメソッド呼び出しです。ログを開いて、例外の行をそのまま貼ってください。",
      proposal: proposal(state, "cat log/development.log", "開発ログを表示する", false),
    };
  }

  if (/linux|コマンド|シェル|ubuntu/.test(lower)) {
    return {
      text: "この画面のシェルは FOX OS のワークスペースです。ls、cd、cat、ruby -v、bin/rails が使えます。Ubuntu のカーネルや apt はこのプレビューにはありません。help で一覧が出ます。",
      proposal: proposal(state, "help", "使えるコマンドを表示する", false),
    };
  }

  if (/git|ブランチ/.test(lower)) {
    return {
      text: "いまのブランチと、未コミットの変更があるかは git status で分かります。表示はワークスペースの記録であって、GitHub への push はまだ別の手順です。",
      proposal: proposal(state, "git status", "ブランチと変更状態を表示する", false),
    };
  }

  if (/レビュー|リファクタ|ドキュメント/.test(lower)) {
    return {
      text: "HomeController は 1 アクションだけなので、今は分割する理由がありません。文字列を変えるなら render plain の中だけを触ります。秘密鍵や API キーをソースに書かないでください。",
      proposal: proposal(state, "cat app/controllers/home_controller.rb", "レビュー対象のコードを開く", false),
    };
  }

  return {
    text: "Ruby と Rails の範囲で答えます。コントローラー、モデル、マイグレーション、テスト、サーバー起動、エラーの読み方を聞けます。コマンドが必要なら、実行前に内容を出して承認を待ちます。",
  };
}
