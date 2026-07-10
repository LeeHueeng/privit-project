# Aegis Security CLI

[English](./README.md) · [한국어](./README.ko.md) · [日本語](./README.ja.md) · [中文](./README.zh-CN.md)

Aegis Security CLI は、Privit Aegis の再利用可能な CLI エンジンです。
認可された範囲でのみ動作し、実行前に scope を確認し、安全な catalog から
検査を選択し、機密情報をマスクして JSON、Markdown、HTML、SARIF レポートを
生成します。

Web コンソール、GitHub Pages、AI 設定、Privit 固有のレポート運用は別の
workspace repository で管理します:
<https://github.com/LeeHueeng/privit-aegis-workspace>

## Repository Role

| Repository | Role |
| --- | --- |
| `privit-project` | 再利用可能な Aegis CLI engine |
| `privit-aegis-workspace` | Web console、reports、Pages、AIGate CI showcase |

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

## よく使うコマンド

```bash
aegis init
aegis scope verify
aegis catalog generate
aegis docs generate --lang all
aegis plan --mode passive --target frontend
aegis run --mode passive --target frontend --dry-run
aegis report --format html
aegis report --format sarif
```

Workspace との連携は [`docs/WORKSPACE_INTEGRATION.md`](./docs/WORKSPACE_INTEGRATION.md) を参照してください。
