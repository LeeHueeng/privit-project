# Aegis Security CLI

[English](./README.md) · [한국어](./README.ko.md) · [日本語](./README.ja.md) · [中文](./README.zh-CN.md)

Aegis Security CLI は、認可された範囲でのみ動作する非破壊のセキュリティ
検証 CLI です。実行前に scope を確認し、安全な catalog から検査を選択し、
機密情報をマスクして JSON、Markdown、HTML、SARIF レポートを生成します。

## クイックスタート

```bash
npm install
npm run catalog:generate
npm run aegis -- init
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend
npm run aegis -- run --target frontend --mode passive --dry-run
npm run aegis -- report --format html
```

公開後は GitHub から直接インストールできます。

```bash
npm install -g github:LeeHueeng/privit-project
aegis help --lang ja-JP
```

npm package 名は `aegis-security-cli` として準備済みですが、まだ npm registry
には公開していません。
