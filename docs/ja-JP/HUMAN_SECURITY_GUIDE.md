# Aegis CLI ユーザーセキュリティガイド

Aegis CLI は、チームが所有またはテスト承認を受けたサービスに対して、承認済みで非破壊のセキュリティチェックを実行するためのツールです。

## クイックスタート

```bash
npm install
npm run catalog:generate
npm run aegis -- profiles list
npm run aegis -- init --profile baseline_web
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend --profile baseline_web
npm run aegis -- run --target frontend --mode passive
npm run aegis -- report --format html
```

## 承認とスコープ

`aegis.scope.json` は必須です。プロジェクト、環境、有効な対象、許可 host/path、拒否 path、承認所有者、証明方式、有効期限、安全制限を記録します。本番環境は既定で passive-only です。

## 多様なトレーニングプロファイル

Aegis は 1 社または 1 業種に固定されません。承認済みスコープを維持しながら、業種別のリスク質問、優先チェック、証拠収集の観点を切り替えられます。

| プロファイル | 説明 | 安全モード | 主な対象 |
| --- | --- | --- | --- |
| baseline_web | General web application coverage for teams starting from a neutral baseline. | passive, ci, safe_active | frontend, backend_api, ci_cd |
| saas_b2b | Tenant isolation, role boundaries, admin surfaces, billing metadata, and integration settings. | passive, authenticated, ci | frontend, backend_api, ci_cd |
| ecommerce_marketplace | Checkout, seller workflows, price integrity, inventory transitions, coupons, and order privacy. | passive, safe_active, ci | frontend, backend_api, ci_cd |
| fintech_payments | High-sensitivity passive-first coverage for payments, wallet, ledger, KYC, and audit evidence. | passive, ci, db_audit | frontend, backend_api, database, ci_cd |
| healthcare_privacy | Patient privacy, appointment workflows, consent boundaries, portal access, and auditability. | passive, authenticated, ci, db_audit | frontend, backend_api, database, ci_cd |
| public_education | Citizen or student portals, document workflows, accessibility-adjacent evidence, and procurement-safe CI. | passive, ci, authenticated | frontend, backend_api, ci_cd |
| internal_admin | Backoffice role separation, support tooling, audit trails, admin routes, and safe operational checks. | passive, authenticated, ci, db_audit | frontend, backend_api, database, ci_cd |
| api_platform | OpenAPI hygiene, API keys, rate-limit metadata, developer docs, webhooks, and integration boundaries. | passive, safe_active, authenticated, ci | backend_api, frontend, ci_cd |
| media_community | User-generated content, moderation queues, profile privacy, notification flows, and media metadata. | passive, safe_active, authenticated, ci | frontend, backend_api, ci_cd |

## フロントエンド異常キャプチャ

フロントエンドチェックは、ヘッダー、コンソールエラー、失敗したネットワーク概要、スクリーンショット、DOM スナップショットなどの安全なブラウザ/ランタイム証拠を収集します。

## バックエンド/API テスト

API チェックは安全カタログから選択されます。認証および role matrix チェックには明示的な承認と専用テストアカウントが必要です。

## DB 読み取り専用監査

データベース監査モードは読み取り専用の設定レビューに限定されます。書き込みクエリ、スキーマ変更、データダンプはポリシーでブロックされます。

## サプライチェーン検査

CI モードは SAST、SCA、SBOM、コンテナ、IaC、secret scanning 連携向けです。

## Docker 使用方法

```bash
docker build -t aegis/security-cli .
docker run --rm -v "$PWD:/workspace" aegis/security-cli run --scope aegis.scope.json
```

## npm 使用方法

パッケージには `security:init`、`security:plan`、`security:frontend`、`security:api`、`security:ci`、`security:report` スクリプトが含まれます。

## CI/CD 使用方法

`aegis scope verify`、`aegis plan --mode ci`、`aegis run --mode ci` を実行し、`aegis report --format sarif` で SARIF を生成します。

## レポートと修正

レポートにはスコープ、環境、スキャン設定、重要度別 finding、artifact、認証 matrix プレースホルダー、サプライチェーン準備状況、DB 監査準備状況、修正ガイドが含まれます。
