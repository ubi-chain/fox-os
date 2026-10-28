初期ID admin
初期パスワード admin

ISO を作る
この repo では、os/build.sh を使って Ubuntu 24.04 ベースの FOX OS ISO を作ります
実行コマンドは
bash
cd os
sudo ./build.sh --i-understand
成功すると fox-os-amd64.hybrid.iso ができます
USB に入れる
その ISO を USB に書き込みます
Windows なら Rufus が一番簡単です
この ISO は hybrid.iso なので、USB 起動用としてそのまま使えます
USB を起動する
USB を差した状態で PC を再起動
BIOS/UEFI の起動メニューを開く
F12 / F11 / ESC / Del のどれかを押す
USB を選んで起動
バッチファイルの役割
バッチファイルは「再起動して起動メニューを出す」ためのものです
実際に USB を起動させるのは PC の BIOS/UEFI 設定です
.bat はその手助けをするだけです
簡単なバッチ例

bat
@echo off
echo FOX OS USB起動の準備をしています...
echo.
echo USBを差し込んでいることを確認してください
echo F12 / F11 / ESC / Del を押して起動メニューを開いてください
echo USBを選んで起動してください
echo.
shutdown /r /t 5 /f
これを boot-usb.bat として保存して実行すると、5 秒後に再起動します。

もっと簡単な方法
いちばん簡単なのは Windows で Rufus を使うことです
Rufus で「ISO を選ぶ → USB を選ぶ → 開始」を押すだけでOKです
重要なこと
USB に書き込むドライブは間違えないでください
dd を使う場合は /dev/sdX を間違えないこと
USB の選択は BIOS/UEFI の起動メニューで行います
一番短く言うと:

os/build.sh で ISO 作成
Rufus で USB に書き込み
PC の起動メニューで USB を選ぶ
boot-usb.bat は「再起動して起動メニューを開く手助け」だけ
必要なら次に、

「Rufus の具体的な設定画面」
「Windows用の最短バッチファイル」
「Linux/macOS の dd で USB に書き込む 1 コマンド」 まで、超簡単な形で書きます。
