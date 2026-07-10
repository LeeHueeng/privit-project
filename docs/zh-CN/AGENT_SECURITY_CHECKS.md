# 代理安全检查

本文档为 Aegis CLI 代理和工具适配器生成，定义仅在授权范围内安全执行非破坏性安全测试的操作规则。

## 代理操作原则

- 没有 `aegis.scope.json` 时，不允许规划或执行检查。
- 只执行 `catalog/security-checks.jsonl` 中的非破坏性检查。
- 只使用 allowlist 中的工具适配器。
- LLM 输出仅用于规划和总结，不作为直接 shell 权限。
- 在使用 LLM 和生成报告前 redaction 敏感信息。

## 范围保护规则

- 所有 URL 必须匹配目标的 `allowed_hosts` 和 `allowed_paths`。
- 匹配 `denied_paths` 的请求会被阻止。
- 生产环境默认只允许 `passive` 模式。
- `authenticated` 和 `db_audit` 需要明确的手动批准。
- 破坏性测试、暴力尝试、数据外传、持久化和规避行为都会被阻止。

## 允许的工具

| 适配器 | 工具 | 允许模式 |
| --- | --- | --- |
| scope_guard_adapter | Aegis Scope Guard | passive, safe_active, authenticated, ci, db_audit |
| playwright_adapter | Playwright | passive, safe_active, authenticated, ci |
| semgrep_adapter | Semgrep | ci, local_static_analysis |
| trivy_adapter | Trivy | ci, local_static_analysis |
| syft_adapter | Syft | ci, local_static_analysis |
| zap_adapter | OWASP ZAP | passive, safe_active, authenticated |
| nuclei_adapter | Nuclei | passive, safe_active |
| db_readonly_adapter | Internal DB Audit | db_audit |

## 执行模式矩阵

| 模式 | 生产安全性 | 手动批准 | 描述 |
| --- | --- | --- | --- |
| passive | true | false | Minimal requests and passive metadata checks. |
| safe_active | false | false | Non-destructive validation for staging or development. |
| authenticated | passive_only | true | Role-aware tests with approved test accounts. |
| ci | true | false | Static, supply-chain, SBOM, IaC, and secret scanning gates. |
| db_audit | false | true | Read-only database configuration audit. |

## 检查目录选择

- governance_scope_policy: 80 checks, passive, ci_cd
- asset_inventory_passive_discovery: 140 checks, passive, frontend
- frontend_browser_runtime: 180 checks, passive, frontend
- frontend_static_bundle: 140 checks, ci, frontend
- backend_api_authentication: 160 checks, authenticated, backend_api
- backend_api_authorization: 220 checks, authenticated, backend_api
- backend_api_input_validation: 200 checks, safe_active, backend_api
- session_cookie_token: 150 checks, passive, frontend
- security_headers_tls_cors: 120 checks, passive, frontend
- database_readonly_audit: 140 checks, db_audit, database
- supply_chain_sast_sca_container_iac: 260 checks, ci, ci_cd
- ci_cd_secret_release: 150 checks, ci, ci_cd
- business_logic_safe_checks: 140 checks, safe_active, backend_api
- logging_monitoring_error_handling: 90 checks, passive, backend_api
- cloud_kubernetes_config_audit: 180 checks, ci, iac
- privacy_data_minimization: 80 checks, passive, backend_api
- attack_emulation_recon_exposure: 45 checks, passive, frontend
- attack_emulation_initial_access: 45 checks, passive, frontend
- attack_emulation_credential_access: 45 checks, passive, frontend
- attack_emulation_execution_lolbin: 45 checks, ci, ci_cd
- attack_emulation_persistence_hunting: 45 checks, ci, backend_api
- attack_emulation_privilege_escalation: 45 checks, ci, backend_api
- attack_emulation_defense_evasion: 45 checks, ci, backend_api
- attack_emulation_lateral_movement: 45 checks, ci, backend_api
- attack_emulation_collection_exfiltration: 45 checks, passive, frontend
- attack_emulation_command_control: 45 checks, ci, ci_cd
- attack_emulation_impact_resilience: 45 checks, passive, backend_api
- attack_emulation_fraud_abuse: 45 checks, passive, frontend

1. 加载已验证的 scope。
2. 按目标类型和执行模式过滤。
3. 拒绝 `destructive=true` 的检查。
4. 没有批准时拒绝需要手动批准的检查。
5. 拒绝未知工具适配器。
6. 应用 scope safety 中的 rate limit 和 concurrency。

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

## 证据收集

artifact 存储在 `.aegis/artifacts/<target>/<scan-id>/`，标准化结果存储在 `.aegis/scans/<scan-id>/results.json`。保存请求/响应元数据，但不保存敏感值。

## 前端异常捕获

捕获 console error、page error、failed network request、auth state mismatch、visual regression 和 browser security policy event。

## 认证测试规则

只使用专用测试账号，不复用生产用户凭据。只保存角色名称和 session 元数据，并 redaction token/cookie。

## Finding 标准化

每个 finding 应包含 id、project、environment、asset、target type、category、title、severity、confidence、status、redacted evidence、impact、safe reproduction、recommendation、mapped standards 和 timestamps。

## 报告生成

报告可生成为 JSON、Markdown、HTML 或 SARIF。报告必须执行 secret redaction，并避免包含 payload 目录、绕过步骤、权限提升步骤或数据提取步骤。
