# Agent Security Checks

This document is generated for Aegis CLI agents and tool adapters. It defines safe operating rules for non-destructive security testing inside approved scope only.

## Agent Operating Principles

- Require `aegis.scope.json` before planning or running checks.
- Execute only non-destructive checks from `catalog/security-checks.jsonl`.
- Use allowlisted tool adapters only.
- Treat LLM output as planning and summarization, not direct shell authority.
- Redact secrets before LLM use and before report generation.

## Scope Guard Rules

- Every URL must match the target `allowed_hosts` and `allowed_paths`.
- Any `denied_paths` match blocks the request.
- Production environments default to `passive` mode only.
- `authenticated` and `db_audit` require explicit manual approval.
- Destructive, brute-force, exfiltration, persistence, and evasion behaviors are blocked.

## Allowed Tools

| Adapter | Tool | Allowed modes |
| --- | --- | --- |
| scope_guard_adapter | Aegis Scope Guard | passive, safe_active, authenticated, ci, db_audit |
| playwright_adapter | Playwright | passive, safe_active, authenticated, ci |
| semgrep_adapter | Semgrep | ci, local_static_analysis |
| trivy_adapter | Trivy | ci, local_static_analysis |
| syft_adapter | Syft | ci, local_static_analysis |
| zap_adapter | OWASP ZAP | passive, safe_active, authenticated |
| nuclei_adapter | Nuclei | passive, safe_active |
| db_readonly_adapter | Internal DB Audit | db_audit |

## Execution Mode Matrix

| Mode | Safe for production | Manual approval | Description |
| --- | --- | --- | --- |
| passive | true | false | Minimal requests and passive metadata checks. |
| safe_active | false | false | Non-destructive validation for staging or development. |
| authenticated | passive_only | true | Role-aware tests with approved test accounts. |
| ci | true | false | Static, supply-chain, SBOM, IaC, and secret scanning gates. |
| db_audit | false | true | Read-only database configuration audit. |

## Check Catalog Selection

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

1. Load the verified scope.
2. Filter by target type and execution mode.
3. Reject checks with `destructive=true`.
4. Reject manual-approval checks unless approval is present.
5. Reject unknown tool adapters.
6. Apply rate limits and concurrency from scope safety settings.

## Diverse Training Profiles

Aegis is not tied to one company or one industry. It keeps authorization and scope controls intact while changing industry risk questions, priority checks, and evidence focus.

| Profile | Description | Safe modes | Target focus |
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

## Safe Attack Emulation Packs

Attack packs do not execute attacks. They translate MITRE ATT&CK tactics into defensive validation checks. Exploitation, credential theft, persistence, exfiltration, and destructive behavior remain blocked.

| Pack | Description | Allowed modes | Tactics |
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

## Evidence Collection

Artifacts are stored in `.aegis/artifacts/<target>/<scan-id>/`, and normalized results are stored in `.aegis/scans/<scan-id>/results.json`. Request and response metadata is stored without sensitive values.

## Frontend Anomaly Capture

Capture console errors, page errors, failed network requests, auth state mismatches, visual regressions, and browser security policy events.

## Authenticated Testing Rules

Use dedicated test accounts only and never reuse production user credentials. Store role names and session metadata while redacting tokens and cookies.

## Finding Normalization

Every finding should include id, project, environment, asset, target type, category, title, severity, confidence, status, redacted evidence, impact, safe reproduction, recommendation, mapped standards, and timestamps.

## Report Generation

Reports may be generated as JSON, Markdown, HTML, or SARIF. Reports must redact secrets and avoid payload catalogs, bypass procedures, privilege escalation steps, or data extraction procedures.
