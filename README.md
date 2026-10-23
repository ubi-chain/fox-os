# FOX OS

Ubuntu 24.04 のライブ ISO を作る定義は [os/README.md](os/README.md) です。
ビルドは Ubuntu 機で `sudo ./os/build.sh --i-understand` です。ISO 自体はリポジトリに入っていません。

ブラウザの画面は、その机の見た目を確認するものです。起動カーネルではありません。


ブラウザ机で試せること:

- `ruby -v` / `rails -v`
- `cd sample_app` のあと `bin/rails test` と `bin/rails server`
- アシスタントのコマンドは承認するまで実行しない

固定バージョン（机の中、および ISO のフック）: Ruby 3.3.6、Rails 7.2.2、Bundler 2.5.16、mise v2026.2.9。
API キーは含めていません。
