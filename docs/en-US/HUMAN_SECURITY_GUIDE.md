# Aegis CLI Human Security Guide

Aegis CLI helps teams run authorized, non-destructive security checks against services they own or are approved to test.

## Quick Start

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

## Authorization and Scope

`aegis.scope.json` is mandatory. It records project, environment, enabled targets, allowlisted hosts and paths, denied paths, authorization owner, proof type, expiry, and safety limits. Production defaults to passive-only behavior.

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

## Frontend Anomaly Capture

Frontend checks collect safe browser/runtime evidence such as headers, console errors, failed network summaries, screenshots, and DOM snapshots.

## Backend/API Testing

API checks are selected from the safe catalog. Authenticated and role-matrix checks require explicit approval and dedicated test accounts.

## DB Read-only Audit

Database audit mode is limited to read-only configuration review. Write queries, schema mutation, and data dumps are blocked by policy.

## Supply Chain Scan

CI mode is designed for SAST, SCA, SBOM, container, IaC, and secret scanning integrations.

## Docker Usage

```bash
docker build -t aegis/security-cli .
docker run --rm -v "$PWD:/workspace" aegis/security-cli run --scope aegis.scope.json
```

## npm Usage

The package includes scripts such as `security:init`, `security:plan`, `security:frontend`, `security:api`, `security:ci`, and `security:report`.

## CI/CD Usage

Run `aegis scope verify`, `aegis plan --mode ci`, `aegis run --mode ci`, then publish SARIF with `aegis report --format sarif`.

## Reports and Remediation

Reports include scope, environment, scan configuration, findings by severity, artifacts, authenticated matrix placeholders, supply-chain readiness, DB audit readiness, and remediation guidance.
