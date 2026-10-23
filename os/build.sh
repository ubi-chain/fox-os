#!/bin/sh
set -eu
cd "$(dirname "$0")"

if [ "$(id -u)" -ne 0 ]; then
  echo "root で実行してください。sudo ./build.sh --i-understand" >&2
  exit 1
fi

if [ "${1:-}" != "--i-understand" ]; then
  echo "Ubuntu パッケージと Ruby をダウンロードし、数十GBを使います。" >&2
  echo "ビルドツリーを消す操作は lb clean です。" >&2
  echo "続ける場合: sudo ./build.sh --i-understand" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y live-build curl ca-certificates

lb clean
lb config
lb build
