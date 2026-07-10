# Examples

## Initialize a Local Scope

```bash
npm run aegis -- init
npm run aegis -- scope verify
```

## Plan Passive Frontend Checks

```bash
npm run aegis -- plan --mode passive --target frontend
```

## Plan by Industry Profile

```bash
npm run aegis -- profiles list
npm run aegis -- profiles show fintech_payments
npm run aegis -- init --profile healthcare_privacy
npm run aegis -- plan --mode passive --target frontend --profile ecommerce_marketplace
```

## Plan Safe Attack Emulation

These commands turn ATT&CK-style tactics into defensive validation priorities.
They do not run exploit payloads, brute force, persistence, C2 traffic, data
exfiltration, or destructive writes.

```bash
npm run aegis -- attacks list
npm run aegis -- attacks show credential_access_defense
npm run aegis -- init --attack-pack initial_access_hardening
npm run aegis -- plan --mode passive --target frontend --attack-pack recon_exposure_review
```

## Dry Run Without Target Requests

```bash
npm run aegis -- run --target frontend --mode passive --dry-run
```

## Generate Reports

```bash
npm run aegis -- report --format markdown
npm run aegis -- report --format html
npm run aegis -- report --format sarif
```

## Generate Localized Docs

```bash
npm run docs:generate
npm run docs:generate:ko
npm run docs:generate:ja
npm run docs:generate:zh
npm run docs:generate:en
```

## Install as a Workspace Engine

Use the public GitHub source directly:

```bash
npm install -g github:LeeHueeng/privit-project
aegis help --lang ko-KR
```

Pin a specific engine revision in CI:

```bash
npm install -g "git+https://github.com/LeeHueeng/privit-project.git#<commit-sha>"
```

For local development, link the package into a workspace:

```bash
npm link
cd ../privit-aegis-workspace
npm link aegis-security-cli
aegis scope verify
```
