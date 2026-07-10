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
