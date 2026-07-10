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
npm run aegis -- profiles list
npm run aegis -- attacks list
npm run aegis -- init --profile baseline_web --attack-pack initial_access_hardening
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend --profile baseline_web --attack-pack initial_access_hardening
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

## 安全な攻撃エミュレーションパック

[`mukul975/Anthropic-Cybersecurity-Skills`](https://github.com/mukul975/Anthropic-Cybersecurity-Skills)
の ATT&CK ベースの構造を参考にしていますが、Aegis は実攻撃を実行しません。
攻撃者の戦術を、防御検証、証跡要件、禁止アクション、安全な計画メタデータに
変換します。

```bash
npm run aegis -- attacks list
npm run aegis -- attacks show credential_access_defense
npm run aegis -- plan --mode passive --target frontend --attack-pack recon_exposure_review
```

現在の pack は、偵察露出レビュー、初期アクセスの堅牢化、認証情報アクセス防御、
実行/LOLBin 検知、永続化ハンティング準備、権限昇格制御、防御回避テレメトリ、
横展開準備、収集/流出監視、C2 検知、ランサムウェア復元力、不正/悪用監視です。

設計上ブロックされるもの: exploit payload、phishing delivery、password guessing、
credential dumping、persistence creation、C2 traffic、data exfiltration、
destructive write activity。

## よく使うコマンド

```bash
aegis init
aegis profiles list
aegis profiles show saas_b2b
aegis attacks list
aegis attacks show credential_access_defense
aegis scope verify
aegis catalog generate
aegis docs generate --lang all
aegis plan --mode passive --target frontend --profile saas_b2b --attack-pack initial_access_hardening
aegis run --mode passive --target frontend --dry-run
aegis report --format html
aegis report --format sarif
```

Workspace との連携は [`docs/WORKSPACE_INTEGRATION.md`](./docs/WORKSPACE_INTEGRATION.md) を参照してください。
