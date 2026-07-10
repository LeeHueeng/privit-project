# Aegis CLI 用户安全指南

Aegis CLI 帮助团队对其拥有或已获授权测试的服务运行授权、非破坏性的安全检查。

## 快速开始

```bash
npm install
npm run catalog:generate
npm run aegis -- profiles list
npm run aegis -- attacks list
npm run aegis -- init --profile baseline_web --attack-pack initial_access_hardening
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend --profile baseline_web --attack-pack initial_access_hardening
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

## 安全攻击仿真包

攻击包不会执行真实攻击，而是把 MITRE ATT&CK 战术转换为防御性验证项。exploit、credential theft、persistence、exfiltration 和 destructive behavior 仍然被阻止。

| 包 | 说明 | 允许模式 | 战术 |
| --- | --- | --- | --- |
| recon_exposure_review | Passive review of public discovery, metadata, sitemap, robots, API docs, and accidental admin surface exposure. | passive, ci | TA0043 Reconnaissance |
| initial_access_hardening | Safe checks for exposed apps, phishing readiness evidence, external service policy, and supply-chain entry points. | passive, ci | TA0001 Initial Access |
| credential_access_defense | Validate safe controls and telemetry around secret storage, token exposure, password policy, and credential-dumping detection readiness. | passive, ci, authenticated | TA0006 Credential Access |
| execution_lolbin_detection | Review logging and detection readiness for script interpreters, scheduled execution, and living-off-the-land behavior. | ci, authenticated | TA0002 Execution |
| persistence_hunting_readiness | Safe assessment of audit trails and configuration evidence for account manipulation, scheduled jobs, startup paths, and web shell indicators. | ci, authenticated, db_audit | TA0003 Persistence |
| privilege_escalation_controls | Review least-privilege, privileged route boundaries, Kubernetes/container posture, and elevation audit evidence. | ci, authenticated, db_audit | TA0004 Privilege Escalation |
| defense_evasion_telemetry | Assess detection coverage for logging gaps, tamper signals, obfuscation indicators, and unusual process or file metadata. | ci, authenticated | TA0005 Defense Evasion, TA0112 Defense Impairment |
| lateral_movement_readiness | Review segmentation, service-account boundaries, admin surface exposure, and telemetry for lateral movement patterns. | ci, authenticated | TA0008 Lateral Movement |
| collection_exfiltration_monitoring | Validate redaction, data minimization, export controls, DNS/object-storage telemetry, and large-transfer alert readiness. | passive, ci, db_audit | TA0009 Collection, TA0010 Exfiltration |
| command_control_detection | Review egress controls, suspicious beacon telemetry, DNS/HTTP log readiness, and proxy policy without generating traffic. | ci, passive | TA0011 Command and Control |
| impact_ransomware_resilience | Review backup posture, destructive-action deny paths, recovery evidence, and ransomware precursor alerting. | passive, ci, db_audit | TA0040 Impact |
| fraud_abuse_monitoring | Safe financial-abuse review for beneficiary changes, refund abuse, account warming, and monetization telemetry. | passive, authenticated, ci | MITRE F3 Positioning, MITRE F3 Monetization |

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
