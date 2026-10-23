# FOX OS — Ubuntu 24.04 ライブイメージ

このディレクトリは、Ubuntu 24.04 LTS (noble) から FOX OS の起動用 ISO を作る定義です。
プレビューのブラウザ机とは別物です。ISO 自体はこの環境では作っていません。

## 必要なもの

- Ubuntu 24.04 のビルド機
- root
- 空きディスク 25GB 以上
- ネットワーク（パッケージ、mise、Ruby の取得）

## 固定するもの

| 対象 | 値 |
| --- | --- |
| Ubuntu | 24.04 noble, amd64 |
| mise | v2026.2.9 |
| Ruby | 3.3.6（mise。システムの Ruby パッケージは入れない） |
| Bundler | 2.5.16 |
| Rails | 7.2.2 |
| データベース | sqlite3 |

## ビルド

`lb clean` は `cache/` `chroot/` `binary/` を消します。作った ISO も消えます。

```bash
cd os
sudo ./build.sh --i-understand
```

成功すると `fox-os-amd64.hybrid.iso` ができます。
起動確認は仮想マシンで行ってください。このプレビューは ISO を起動できません。

ライブユーザー名は `fox`、ホスト名は `fox-os` です。
パスワードは casper の標準に任せており、リポジトリには書いていません。
API キーも入れていません。
