# Workspace Integration

Aegis Security CLI is designed to be consumed by workspaces. The CLI engine stays
small and reusable; each workspace owns its target scope, web console,
project-specific reports, CI policy, and launch documentation.

## Two-Repository Model

| Repository | Responsibility |
| --- | --- |
| `LeeHueeng/privit-project` | Aegis CLI engine, scanner logic, catalog generation, report writers |
| `LeeHueeng/privit-aegis-workspace` | Privit scope, local web console, localized reports, GitHub Pages, AIGate CI |

This split keeps the engine package easy to install and test while allowing the
workspace to evolve its UX and documentation independently.

## Install from GitHub

```bash
npm install -g github:LeeHueeng/privit-project
aegis help --lang ko-KR
```

## Pin in CI

Workspaces should pin a known-good engine commit:

```bash
npm install -g "git+https://github.com/LeeHueeng/privit-project.git#<commit-sha>"
```

Pinning gives CI reproducibility and makes engine upgrades reviewable.

## Local Development Link

```bash
cd privit-project
npm link

cd ../privit-aegis-workspace
npm link aegis-security-cli
aegis version
```

Unlink when finished:

```bash
npm unlink aegis-security-cli
```

## Compatibility Contract

Workspace consumers can rely on these commands:

- `aegis init`
- `aegis scope verify`
- `aegis catalog generate`
- `aegis docs generate --lang all`
- `aegis plan --mode passive --target frontend`
- `aegis run --mode passive --target frontend`
- `aegis findings list`
- `aegis report --format markdown`
- `aegis report --format html`
- `aegis report --format sarif`

Breaking changes to command names, output shape, generated file names, or report
formats should be documented in `CHANGELOG.md` before the workspace updates its
pinned commit.

## Issue Routing

- CLI command errors, scanner logic, catalog generation, or report writer bugs:
  open issues in `privit-project`.
- Web console UX, Pages site, AI settings, local report presentation, or Privit
  scope wiring: open issues in `privit-aegis-workspace`.
