import { CATEGORY_DISTRIBUTION, EXECUTION_MODES, TOOL_ADAPTERS } from "./config.js";
import { writeText } from "./io.js";

function adapterTable() {
  return Object.entries(TOOL_ADAPTERS)
    .map(([id, adapter]) => `| ${id} | ${adapter.tool} | ${adapter.allowedModes.join(", ")} |`)
    .join("\n");
}

function modeTable() {
  return Object.entries(EXECUTION_MODES)
    .map(([id, mode]) => `| ${id} | ${mode.safeForProduction} | ${mode.requiresManualApproval} | ${mode.description} |`)
    .join("\n");
}

function categoryBullets() {
  return CATEGORY_DISTRIBUTION.map((category) => `- ${category.category}: ${category.plannedChecks} checks, ${category.executionMode}, ${category.targetType}`).join("\n");
}

export function renderAgentSecurityChecks() {
  return `# Agent Security Checks

This document is generated for Aegis CLI agents and tool adapters. It defines safe operating rules for authorized security testing only.

## Agent Operating Principles

- Require \`aegis.scope.json\` before planning or running checks.
- Execute only non-destructive checks from \`catalog/security-checks.jsonl\`.
- Use allowlisted tool adapters only.
- Treat LLM output as planning and summarization, not direct shell authority.
- Redact secrets before LLM use and before report generation.
- Store evidence with enough metadata to reproduce a safe finding without exposing secrets.

## Scope Guard Rules

- Every URL must match the target \`allowed_hosts\` and \`allowed_paths\`.
- Any \`denied_paths\` match blocks the request.
- Production environments default to \`passive\` mode only.
- \`authenticated\` and \`db_audit\` require explicit manual approval.
- Destructive, brute-force, exfiltration, persistence, and evasion behaviors are blocked.

## Allowed Tools

| Adapter | Tool | Allowed modes |
| --- | --- | --- |
${adapterTable()}

## Execution Mode Matrix

| Mode | Safe for production | Manual approval | Description |
| --- | --- | --- | --- |
${modeTable()}

## Check Catalog Selection

Catalog categories:

${categoryBullets()}

Selection logic:

1. Load the verified scope.
2. Filter by target type and execution mode.
3. Reject checks with \`destructive=true\`.
4. Reject manual-approval checks unless approval is present.
5. Reject unknown tool adapters.
6. Apply rate limits and concurrency from scope safety settings.

## Evidence Collection

- Use \`.aegis/artifacts/<target>/<scan-id>/\` for artifacts.
- Use \`.aegis/scans/<scan-id>/results.json\` for normalized scan results.
- Store request and response metadata, not sensitive values.
- Screenshots must mask password, token, and payment fields where possible.

## Frontend Anomaly Capture

Capture console errors, page errors, failed network requests, auth state mismatches, visual regressions, and browser security policy events. Artifacts include screenshot, full-page screenshot when available, DOM snapshot, console log, and network summary.

## Authenticated Testing Rules

- Use dedicated test accounts only.
- Never reuse production user credentials.
- Store role names and session metadata; redact tokens and cookies.
- Include role matrix evidence in reports.

## Finding Normalization

Every finding should include id, project, environment, asset, target type, category, title, severity, confidence, status, redacted evidence, impact, safe reproduction, recommendation, mapped standards, and timestamps.

## Report Generation

Reports may be generated as JSON, Markdown, HTML, or SARIF. Reports must redact secrets and avoid publishing payload catalogs, bypass procedures, privilege escalation steps, or data extraction procedures.
`;
}

export function renderHumanSecurityGuide() {
  return `# Aegis CLI Human Security Guide

Aegis CLI helps teams run authorized, non-destructive security checks against services they own or are approved to test.

## Quick Start

\`\`\`bash
npm install
npm run catalog:generate
npm run aegis -- init
npm run aegis -- scope verify
npm run aegis -- plan --mode passive --target frontend
npm run aegis -- run --target frontend --mode passive
npm run aegis -- report --format html
\`\`\`

## Authorization and Scope

\`aegis.scope.json\` is mandatory. It records project, environment, enabled targets, allowlisted hosts and paths, denied paths, authorization owner, proof type, expiry, and safety limits.

Production defaults to passive-only behavior. Active checks require a staging or development environment and must remain non-destructive.

## Frontend Testing

Frontend checks collect safe browser/runtime evidence such as headers, console errors, failed network summaries, screenshots, and DOM snapshots. Captured artifacts are stored under \`.aegis/artifacts/frontend\`.

## Backend/API Testing

API checks are selected from the safe catalog. Authenticated and role-matrix checks require explicit approval and dedicated test accounts.

## DB Read-only Audit

Database audit mode is limited to read-only configuration review. Write queries, schema mutation, and data dumps are blocked by policy.

## Supply Chain Scan

CI mode is designed for SAST, SCA, SBOM, container, IaC, and secret scanning integrations. This MVP records the selected checks and adapter readiness so teams can wire approved scanners later.

## Docker Usage

\`\`\`bash
docker build -t aegis/security-cli .
docker run --rm -v "$PWD:/workspace" aegis/security-cli run --scope aegis.scope.json
\`\`\`

## npm Usage

The package includes scripts such as \`security:init\`, \`security:plan\`, \`security:frontend\`, \`security:api\`, \`security:ci\`, and \`security:report\`.

## CI/CD Usage

Run \`aegis scope verify\`, \`aegis plan --mode ci\`, \`aegis run --mode ci\`, then publish SARIF with \`aegis report --format sarif\`.

## Reports and Remediation

Reports include scope, environment, scan configuration, findings by severity, artifacts, authenticated matrix placeholders, supply-chain readiness, DB audit readiness, and remediation guidance.
`;
}

export async function writeDocs(cwd) {
  await writeText(`${cwd}/docs/AGENT_SECURITY_CHECKS.md`, renderAgentSecurityChecks());
  await writeText(`${cwd}/docs/HUMAN_SECURITY_GUIDE.md`, renderHumanSecurityGuide());
  return {
    files: ["docs/AGENT_SECURITY_CHECKS.md", "docs/HUMAN_SECURITY_GUIDE.md"]
  };
}

