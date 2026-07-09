# Release Process

This repository is npm-ready but not published yet.

## Local Validation

```bash
npm test
npm run catalog:generate
npm run docs:generate
npm pack --dry-run
```

## npm Publication

Package name prepared: `aegis-security-cli`.

Publishing requires npm account ownership and 2FA:

```bash
npm login
npm publish --access public
```

Do not publish until the repository is public, CI is green, and the launch
checklist has been reviewed.
