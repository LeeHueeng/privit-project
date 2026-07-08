# Aegis CLI

Aegis CLI is an MVP scaffold for authorized, non-destructive security verification. It follows the attached planning document by enforcing scope first, selecting checks from a safe catalog, redacting sensitive data, and producing reports.

## Languages

Aegis supports Korean, Japanese, Chinese, and English.

```bash
npm run aegis -- help --lang ko-KR
npm run aegis -- help --lang ja-JP
npm run aegis -- help --lang zh-CN
npm run aegis -- help --lang en-US
AEGIS_LANG=ko-KR npm run aegis -- help
```

Localized docs are generated under:

- `docs/ko-KR/`
- `docs/ja-JP/`
- `docs/zh-CN/`
- `docs/en-US/`

## Quick Start

```bash
npm run catalog:generate
npm run aegis -- init
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend
npm run aegis -- run --target frontend --mode passive --dry-run
npm run aegis -- report --format html
```

## Safety Defaults

- `aegis.scope.json` is required before planning or running.
- Hosts and paths must match the allowlist.
- Production environments only allow passive mode by default.
- Destructive, brute-force, exfiltration, persistence, and evasion behavior is blocked.
- LLMs are not allowed to create or execute arbitrary shell commands.
- Reports and LLM-bound data are redacted.

## Commands

```bash
aegis init
aegis scope verify
aegis catalog generate
aegis docs generate --lang all
aegis docs generate --lang ko-KR
aegis docs generate --lang ja-JP
aegis docs generate --lang zh-CN
aegis docs generate --lang en-US
aegis plan --mode passive --target frontend
aegis run --mode passive --target frontend --dry-run
aegis findings list
aegis report --format markdown
aegis report --format html
aegis report --format sarif
```

## Generated Files

- `aegis.scope.json`: authorization, target allowlists, environment, safety limits.
- `aegis.policy.json`: blocked behavior and tool-adapter policy.
- `aegis.auth.json`: test-account metadata only.
- `aegis.plan.json`: selected safe checks for a run.
- `catalog/security-checks.jsonl`: 2,430 generated safe verification checks.
- `docs/AGENT_SECURITY_CHECKS.md`: agent and adapter operating guide.
- `docs/HUMAN_SECURITY_GUIDE.md`: human usage guide.
- `docs/{ko-KR,ja-JP,zh-CN,en-US}/`: localized agent and human guides.
- `.aegis/`: local scan results, artifacts, findings, and reports.
