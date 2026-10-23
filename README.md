# FOX OS

情報機関のワークステーションを模した、ブラウザで動く開発机です。
狐のエンブレムと、中央から広がるハニカムで起動します。

これは Ubuntu の ISO でも、Linux カーネルでもありません。
Ruby / Rails の操作は画面の中のワークスペースで再現しています。
ターミナルを閉じても、起動した開発サーバーの状態は残ります。

## 固定バージョン

| ツール | バージョン |
| --- | --- |
| Ruby | 3.3.6（mise 想定。システム Ruby は触らない） |
| Rails | 7.2.2 |
| Bundler | 2.5.16 |
| DB | SQLite（プロジェクト単位） |

## 試せること

- `ruby -v` / `rails -v` / `bundle -v`
- `cd sample_app` のあと `bin/rails test`
- `bin/rails server` と `bin/rails server --stop`
- `rails new NAME`
- Q-DEV のボタン（表示はコマンド結果と一致）
- 機内アシスタント。コマンドは承認するまで実行しない

破壊的な操作（`rm`、`db:drop`、`db:rollback`）は確認が出ます。
API キーはこのリポジトリに含まれていません。
