# Supply-Chain Security

Aegis Security CLI uses GitHub Actions to keep the public engine repository
auditable and reproducible.

## Automated Controls

| Control | Workflow | Purpose |
| --- | --- | --- |
| Aegis Security | `.github/workflows/aegis-security.yml` | CLI tests, catalog generation, scope verification, dry run, SARIF report |
| CodeQL | `.github/workflows/codeql.yml` | JavaScript security and quality analysis in GitHub code scanning |
| Dependency Review | `.github/workflows/dependency-review.yml` | Blocks high-severity vulnerable dependencies introduced in pull requests |
| OpenSSF Scorecard | `.github/workflows/scorecard.yml` | Publishes open-source security posture signals |
| SBOM and Provenance | `.github/workflows/sbom.yml` | Generates CycloneDX/SPDX SBOM files and attests the CycloneDX artifact |
| Package Provenance | `.github/workflows/package-provenance.yml` | Packs the npm artifact and creates build provenance for release tags |

## Action Pinning

Actions are pinned by commit SHA instead of mutable tags. Version comments are
kept next to each action so upgrades remain reviewable.

## Secret Protection

This public repository should keep GitHub secret scanning and push protection
enabled. Never commit real target credentials, API tokens, cookies, private keys,
or production scan artifacts.

## npm Publishing

The package is npm-ready as `aegis-security-cli`, but it is not published yet.
When publishing is enabled, use npm trusted publishing or `npm publish
--provenance` so consumers can verify build provenance.
