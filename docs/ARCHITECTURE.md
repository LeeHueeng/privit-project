# Architecture

Aegis Security CLI is intentionally a small engine repository. It owns command
dispatch, scope verification, catalog generation, passive execution, redaction,
and report writers. Product-specific web UI, hosted docs, and local report state
belong in a workspace such as `privit-aegis-workspace`.

```mermaid
flowchart LR
  CLI["bin/aegis.js"] --> Args["src/args.js"]
  Args --> Scope["src/scope.js"]
  Scope --> Planner["src/planner.js"]
  Planner --> Catalog["src/catalog.js"]
  Catalog --> Runner["src/runner.js"]
  Runner --> Reports["src/reports.js"]
  Reports --> Redaction["src/redaction.js"]
  Docs["src/docs.js"] --> I18n["src/i18n.js"]
```

## Repository Boundary

| Layer | Owned here | Owned by workspace |
| --- | --- | --- |
| CLI command parsing | yes | no |
| Scope and policy enforcement | yes | config only |
| Safe check catalog generation | yes | generated catalog copy |
| Passive runner and report writers | yes | orchestration and localization |
| Web console | no | yes |
| GitHub Pages showcase | no | yes |
| AIGate project gate | no | yes |

## Modules

- `src/cli.js`: command dispatch
- `src/scope.js`: authorization and allowlist checks
- `src/catalog.js`: safe check catalog loading and generation
- `src/planner.js`: target/mode selection
- `src/runner.js`: dry-run and passive execution orchestration
- `src/discovery.js`: passive route/form discovery
- `src/reports.js`: JSON, Markdown, HTML, and SARIF reports
- `src/redaction.js`: sensitive value masking
- `src/docs.js`: localized documentation generation

## Design Principles

- Verify scope before execution
- Prefer passive checks
- Store minimal evidence
- Redact before reporting
- Keep AI-facing data sanitized
- Make localized docs deterministic
- Keep reusable engine code separate from project-specific workspace assets
