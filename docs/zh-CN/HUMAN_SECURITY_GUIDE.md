# Aegis CLI 用户安全指南

Aegis CLI 帮助团队对其拥有或已获授权测试的服务运行授权、非破坏性的安全检查。

## 快速开始

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

## 授权和范围

`aegis.scope.json` 是必需文件。它记录项目、环境、启用目标、允许的 host/path、拒绝的 path、授权所有者、证明方式、到期时间和安全限制。生产环境默认为 passive-only。

## 多样化训练配置

Aegis 不绑定到单一公司或行业。在保持授权范围不变的前提下，可以切换行业风险问题、优先检查类别和证据收集视角。

| 配置 | 说明 | 安全模式 | 主要目标 |
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

## 前端异常捕获

前端检查会收集安全的浏览器/运行时证据，例如 headers、console errors、失败网络摘要、screenshots 和 DOM snapshots。

## 后端/API 测试

API 检查从安全目录中选择。认证和 role matrix 检查需要明确批准和专用测试账号。

## 数据库只读审计

数据库审计模式仅限只读配置审查。写查询、schema 变更和数据转储会被策略阻止。

## 供应链扫描

CI 模式用于 SAST、SCA、SBOM、容器、IaC 和 secret scanning 集成。

## Docker 用法

```bash
docker build -t aegis/security-cli .
docker run --rm -v "$PWD:/workspace" aegis/security-cli run --scope aegis.scope.json
```

## npm 用法

该包包含 `security:init`、`security:plan`、`security:frontend`、`security:api`、`security:ci` 和 `security:report` 脚本。

## CI/CD 用法

运行 `aegis scope verify`、`aegis plan --mode ci`、`aegis run --mode ci`，然后用 `aegis report --format sarif` 生成 SARIF。

## 报告和修复

报告包括范围、环境、扫描配置、按严重级别分组的 finding、artifact、认证 matrix 占位、供应链准备状态、DB 审计准备状态和修复建议。
