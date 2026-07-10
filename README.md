# Aegis Security CLI

<p align="center">
  <a href="https://github.com/LeeHueeng/privit-project/actions/workflows/aegis-security.yml"><img alt="Aegis Security" src="https://github.com/LeeHueeng/privit-project/actions/workflows/aegis-security.yml/badge.svg"></a>
  <a href="https://github.com/LeeHueeng/privit-project/actions/workflows/codeql.yml"><img alt="CodeQL" src="https://github.com/LeeHueeng/privit-project/actions/workflows/codeql.yml/badge.svg"></a>
  <a href="https://github.com/LeeHueeng/privit-project/actions/workflows/scorecard.yml"><img alt="OpenSSF Scorecard" src="https://github.com/LeeHueeng/privit-project/actions/workflows/scorecard.yml/badge.svg"></a>
  <img alt="Passive by default" src="https://img.shields.io/badge/security-passive%20by%20default-0f766e">
  <img alt="Multilingual" src="https://img.shields.io/badge/i18n-ko%20%7C%20en%20%7C%20ja%20%7C%20zh-2563eb">
  <img alt="npm ready" src="https://img.shields.io/badge/npm-ready-cb3837">
</p>

<p align="center">
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.md">English</a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.zh-CN.md">中文</a>
</p>

Aegis Security CLI is the reusable engine behind Privit Aegis. It is an
authorized, non-destructive security verification CLI that enforces scope before
execution, selects checks from a safe catalog, redacts sensitive data, and
produces JSON, Markdown, HTML, and SARIF reports.

This repository is intentionally focused on the CLI engine. The web console,
GitHub Pages site, AI settings, local reports, and Privit-specific workflow live
in the workspace repository:
<https://github.com/LeeHueeng/privit-aegis-workspace>.

## Repository Role

| Repository | Purpose | Best for |
| --- | --- | --- |
| `privit-project` | Reusable Aegis CLI engine | CLI install, scanner logic, npm-ready package, library-quality docs |
| `privit-aegis-workspace` | Privit web security workspace | Web console, localized reports, Pages showcase, AIGate CI |

Keeping the engine separate makes the CLI easy to reuse from other workspaces
without carrying Privit-specific report assets, web UI state, or local scan
artifacts.

## Why Star It

- Passive and scope-guarded by default
- 2,430 generated safe verification checks
- Korean, English, Japanese, and Chinese CLI/docs support
- Redacted evidence and report generation built in
- SARIF output for security review systems
- Small Node.js CLI with no runtime dependencies
- Clean separation from the Privit workspace, so the engine can be reused
- CodeQL, Dependency Review, OpenSSF Scorecard, SBOM generation, and provenance
  attestations are wired into GitHub Actions

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
npm install
npm run catalog:generate
npm run aegis -- init
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend
npm run aegis -- run --target frontend --mode passive --dry-run
npm run aegis -- report --format html
```

Install directly from GitHub after this repository is public:

```bash
npm install -g github:LeeHueeng/privit-project
aegis help --lang ko-KR
```

The package is prepared for npm as `aegis-security-cli`, but it has not been
published to npm yet.

## Command Map

| Task | Command |
| --- | --- |
| Create starter files | `aegis init` |
| Verify authorization and allowlists | `aegis scope verify` |
| Rebuild the safe check catalog | `aegis catalog generate` |
| Generate multilingual guides | `aegis docs generate --lang all` |
| Plan passive frontend checks | `aegis plan --mode passive --target frontend` |
| Execute a dry run | `aegis run --mode passive --target frontend --dry-run` |
| List findings | `aegis findings list` |
| Build a human report | `aegis report --format html` |
| Export security tooling output | `aegis report --format sarif` |

## Use with Privit Aegis Workspace

The workspace pins this CLI by commit SHA in GitHub Actions and installs it from
GitHub:

```bash
npm install -g git+https://github.com/LeeHueeng/privit-project.git#<commit-sha>
```

For local development against the workspace, either install from GitHub or link
the package:

```bash
cd privit-project
npm link

cd ../privit-aegis-workspace
npm link aegis-security-cli
aegis help --lang ko-KR
```

See [`docs/WORKSPACE_INTEGRATION.md`](./docs/WORKSPACE_INTEGRATION.md) for the
two-repository workflow.

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

## Documentation

- Examples: [`docs/EXAMPLES.md`](./docs/EXAMPLES.md)
- Architecture: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Detection catalog: [`docs/DETECTION_CATALOG.md`](./docs/DETECTION_CATALOG.md)
- Workspace integration: [`docs/WORKSPACE_INTEGRATION.md`](./docs/WORKSPACE_INTEGRATION.md)
- Supply-chain security: [`docs/SUPPLY_CHAIN_SECURITY.md`](./docs/SUPPLY_CHAIN_SECURITY.md)
- Release process: [`docs/RELEASE_PROCESS.md`](./docs/RELEASE_PROCESS.md)
- Roadmap: [`docs/ROADMAP.md`](./docs/ROADMAP.md)

## Safety Model

This project is for authorized testing only. Do not use it against systems you
do not own or do not have written permission to test. Destructive, brute-force,
exfiltration, persistence, and evasion behavior is blocked by default.

## Non-Goals

- Exploit payload collections
- Brute-force or credential stuffing
- Persistence, evasion, or destructive testing
- Secret extraction or data exfiltration
- Automated attacks against third-party systems

## Contributing

Issues and pull requests are welcome when they keep the default behavior safe
and passive. Start with [`CONTRIBUTING.md`](./CONTRIBUTING.md) and run
`npm test` before opening a pull request.
