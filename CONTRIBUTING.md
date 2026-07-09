# Contributing

Thanks for helping improve Aegis Security CLI.

## Ground Rules

- Keep default behavior passive and authorized.
- Do not add destructive payload execution, brute force, persistence, evasion, or
  data exfiltration flows.
- Do not commit credentials, tokens, cookies, private keys, or private target
  data.
- Update localized docs when public CLI behavior changes.

## Validation

```bash
npm test
npm run catalog:generate
npm run docs:generate
npm run aegis -- scope verify
```

Security checks should document:

- Purpose
- Scope requirements
- Pass criteria
- Evidence retained
- Redaction behavior
