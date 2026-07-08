import path from "node:path";
import { readJson, writeJson, writeText, fileExists } from "./io.js";
import { listFindings, latestScan } from "./runner.js";
import { loadScope } from "./scope.js";
import { redact } from "./redaction.js";

function groupBySeverity(findings) {
  const severities = ["critical", "high", "medium", "low", "info"];
  return Object.fromEntries(severities.map((severity) => [severity, findings.filter((finding) => finding.severity === severity)]));
}

function mdEscape(value) {
  return String(value ?? "").replace(/\|/g, "\\|");
}

function renderMarkdown(scope, scan, findings) {
  const grouped = groupBySeverity(findings);
  const findingRows = findings.length
    ? findings
        .map((finding) => `| ${finding.id} | ${finding.severity} | ${mdEscape(finding.target_type)} | ${mdEscape(finding.title)} | ${finding.status} |`)
        .join("\n")
    : "| - | - | - | No findings recorded | - |";

  return `# Aegis Security Report

## Executive Summary

- Project: ${scope.project}
- Environment: ${scope.environment}
- Latest scan: ${scan?.scan_id || "not run"}
- Findings: ${findings.length}
- Critical: ${grouped.critical.length}
- High: ${grouped.high.length}
- Medium: ${grouped.medium.length}
- Low: ${grouped.low.length}
- Info: ${grouped.info.length}

## Scope and Authorization

- Owner: ${scope.authorization?.owner || "unknown"}
- Proof type: ${scope.authorization?.proof_type || "unknown"}
- Expires at: ${scope.authorization?.expires_at || "unknown"}

## Scan Configuration

- Mode: ${scan?.mode || "not run"}
- Target: ${scan?.target || "not run"}
- Selected checks: ${scan?.selected_check_count ?? 0}
- Executed built-in checks: ${scan?.executed_check_count ?? 0}

## Findings by Severity

| ID | Severity | Target | Title | Status |
| --- | --- | --- | --- | --- |
${findingRows}

## Recommended Fixes

${findings.map((finding) => `- ${finding.id}: ${(finding.recommendation || []).join(" ")}`).join("\n") || "- No remediation required from recorded findings."}

## Appendix: Redaction Policy

Authorization headers, cookies, tokens, passwords, API keys, private keys, email addresses, and payment identifiers are redacted before reporting.
`;
}

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function severityCounts(findings) {
  const grouped = groupBySeverity(findings);
  return {
    critical: grouped.critical.length,
    high: grouped.high.length,
    medium: grouped.medium.length,
    low: grouped.low.length,
    info: grouped.info.length
  };
}

function statusText(findings) {
  if (findings.some((finding) => finding.severity === "critical" || finding.severity === "high")) {
    return { label: "Needs attention", tone: "danger" };
  }
  if (findings.some((finding) => finding.severity === "medium")) {
    return { label: "Review recommended", tone: "warn" };
  }
  if (findings.length > 0) {
    return { label: "Low risk findings", tone: "ok" };
  }
  return { label: "No findings", tone: "ok" };
}

function renderFindingRows(findings) {
  if (findings.length === 0) {
    return '<tr><td colspan="5" class="empty">No findings recorded.</td></tr>';
  }
  return findings
    .map(
      (finding) => `<tr>
        <td><code>${htmlEscape(finding.id)}</code></td>
        <td><span class="severity severity-${htmlEscape(finding.severity)}">${htmlEscape(finding.severity)}</span></td>
        <td>${htmlEscape(finding.target_type)}</td>
        <td>${htmlEscape(finding.title)}</td>
        <td>${htmlEscape(finding.status)}</td>
      </tr>`
    )
    .join("\n");
}

function renderRecommendations(findings) {
  if (findings.length === 0) {
    return "<li>No remediation required from recorded findings.</li>";
  }
  return findings
    .map((finding) => `<li><strong>${htmlEscape(finding.id)}</strong>: ${htmlEscape((finding.recommendation || []).join(" "))}</li>`)
    .join("\n");
}

function renderHtmlReport(scope, scan, findings) {
  const counts = severityCounts(findings);
  const status = statusText(findings);
  const generatedAt = new Date().toISOString();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Aegis Security Report</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f7f9;
      --panel: #ffffff;
      --text: #1f2937;
      --muted: #64748b;
      --line: #d8dee8;
      --ok: #1f8a5b;
      --warn: #b7791f;
      --danger: #c2410c;
      --accent: #2563eb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
    }
    main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 40px; }
    header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 16px;
      align-items: end;
      border-bottom: 1px solid var(--line);
      padding-bottom: 18px;
      margin-bottom: 18px;
    }
    h1, h2 { margin: 0; letter-spacing: 0; }
    h1 { font-size: 28px; line-height: 1.2; }
    h2 { font-size: 18px; margin-bottom: 12px; }
    p { margin: 0; }
    .subtle { color: var(--muted); font-size: 14px; margin-top: 6px; }
    .badge {
      justify-self: start;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 7px 12px;
      font-size: 13px;
      font-weight: 700;
      background: var(--panel);
    }
    .badge.ok { color: var(--ok); border-color: #a7d8c1; }
    .badge.warn { color: var(--warn); border-color: #e7c987; }
    .badge.danger { color: var(--danger); border-color: #f2a486; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(5, minmax(120px, 1fr));
      gap: 12px;
      margin: 18px 0;
    }
    .metric, section {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .metric { padding: 14px; }
    .metric span { display: block; color: var(--muted); font-size: 12px; text-transform: uppercase; }
    .metric strong { display: block; font-size: 28px; line-height: 1.2; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    section { padding: 18px; margin-bottom: 14px; }
    dl { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 8px 14px; margin: 0; }
    dt { color: var(--muted); }
    dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
    th { color: var(--muted); font-weight: 700; background: #f8fafc; }
    code { background: #eef2f7; border-radius: 5px; padding: 2px 5px; }
    ul { margin: 0; padding-left: 20px; }
    .severity {
      display: inline-block;
      min-width: 68px;
      border-radius: 999px;
      padding: 3px 8px;
      text-align: center;
      font-weight: 700;
      font-size: 12px;
      color: #ffffff;
    }
    .severity-critical, .severity-high { background: var(--danger); }
    .severity-medium { background: var(--warn); }
    .severity-low { background: var(--accent); }
    .severity-info { background: var(--muted); }
    .empty { color: var(--muted); text-align: center; padding: 22px; }
    footer { color: var(--muted); font-size: 13px; padding: 8px 0 0; }
    @media (max-width: 820px) {
      main { width: min(100% - 20px, 1180px); padding-top: 18px; }
      header, .grid, .metrics { grid-template-columns: 1fr; }
      dl { grid-template-columns: 1fr; }
      table { display: block; overflow-x: auto; white-space: nowrap; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Aegis Security Report</h1>
        <p class="subtle">${htmlEscape(scope.project)} / ${htmlEscape(scope.environment)} / generated ${htmlEscape(generatedAt)}</p>
      </div>
      <div class="badge ${status.tone}">${htmlEscape(status.label)}</div>
    </header>

    <div class="metrics" aria-label="Finding severity summary">
      <div class="metric"><span>Critical</span><strong>${counts.critical}</strong></div>
      <div class="metric"><span>High</span><strong>${counts.high}</strong></div>
      <div class="metric"><span>Medium</span><strong>${counts.medium}</strong></div>
      <div class="metric"><span>Low</span><strong>${counts.low}</strong></div>
      <div class="metric"><span>Info</span><strong>${counts.info}</strong></div>
    </div>

    <div class="grid">
      <section>
        <h2>Scope and Authorization</h2>
        <dl>
          <dt>Owner</dt><dd>${htmlEscape(scope.authorization?.owner || "unknown")}</dd>
          <dt>Proof type</dt><dd>${htmlEscape(scope.authorization?.proof_type || "unknown")}</dd>
          <dt>Expires at</dt><dd>${htmlEscape(scope.authorization?.expires_at || "unknown")}</dd>
        </dl>
      </section>
      <section>
        <h2>Scan Configuration</h2>
        <dl>
          <dt>Latest scan</dt><dd>${htmlEscape(scan?.scan_id || "not run")}</dd>
          <dt>Mode</dt><dd>${htmlEscape(scan?.mode || "not run")}</dd>
          <dt>Target</dt><dd>${htmlEscape(scan?.target || "not run")}</dd>
          <dt>Selected checks</dt><dd>${htmlEscape(scan?.selected_check_count ?? 0)}</dd>
          <dt>Executed checks</dt><dd>${htmlEscape(scan?.executed_check_count ?? 0)}</dd>
        </dl>
      </section>
    </div>

    <section>
      <h2>Findings</h2>
      <table>
        <thead><tr><th>ID</th><th>Severity</th><th>Target</th><th>Title</th><th>Status</th></tr></thead>
        <tbody>${renderFindingRows(findings)}</tbody>
      </table>
    </section>

    <section>
      <h2>Recommended Fixes</h2>
      <ul>${renderRecommendations(findings)}</ul>
    </section>

    <section>
      <h2>Redaction Policy</h2>
      <p>Authorization headers, cookies, tokens, passwords, API keys, private keys, email addresses, and payment identifiers are redacted before reporting.</p>
    </section>

    <footer>Aegis CLI stores report data locally under <code>.aegis/</code>.</footer>
  </main>
</body>
</html>
`;
}

function renderSarif(findings) {
  const rules = new Map();
  for (const finding of findings) {
    rules.set(finding.category, {
      id: finding.category,
      name: finding.category,
      shortDescription: { text: finding.category },
      help: { text: (finding.recommendation || []).join(" ") || "Review the recorded finding." }
    });
  }

  return {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "Aegis CLI",
            informationUri: "https://example.invalid/aegis-cli",
            rules: [...rules.values()]
          }
        },
        results: findings.map((finding) => ({
          ruleId: finding.category,
          level: finding.severity === "critical" || finding.severity === "high" ? "error" : finding.severity === "medium" ? "warning" : "note",
          message: { text: `${finding.title}: ${finding.evidence?.summary || ""}` },
          properties: {
            finding_id: finding.id,
            confidence: finding.confidence,
            status: finding.status,
            target_type: finding.target_type
          }
        }))
      }
    ]
  };
}

export async function generateReport(cwd, options = {}) {
  const format = options.format || "markdown";
  const { scope } = await loadScope(cwd, options.scopeFile);
  const findings = redact(await listFindings(cwd));
  const scan = redact(await latestScan(cwd));
  const reportsDir = path.resolve(cwd, ".aegis/reports");

  if (format === "json") {
    const file = path.join(reportsDir, "aegis-report.json");
    await writeJson(file, { scope: redact(scope), scan, findings });
    return { format, file };
  }

  if (format === "sarif") {
    const file = path.join(reportsDir, "aegis-report.sarif");
    await writeJson(file, renderSarif(findings));
    return { format, file };
  }

  const markdown = renderMarkdown(redact(scope), scan, findings);
  if (format === "markdown" || format === "md") {
    const file = path.join(reportsDir, "aegis-report.md");
    await writeText(file, markdown);
    return { format: "markdown", file };
  }

  if (format === "html") {
    const file = path.join(reportsDir, "aegis-report.html");
    await writeText(file, renderHtmlReport(redact(scope), scan, findings));
    return { format, file };
  }

  if (format === "junit") {
    const file = path.join(reportsDir, "aegis-report.junit.xml");
    const tests = findings.length || 1;
    const failures = findings.filter((finding) => ["critical", "high"].includes(finding.severity)).length;
    const cases = findings.length
      ? findings
          .map((finding) => `<testcase name="${htmlEscape(finding.id)}"><failure message="${htmlEscape(finding.title)}">${htmlEscape(finding.evidence?.summary || "")}</failure></testcase>`)
          .join("")
      : '<testcase name="no-findings" />';
    await writeText(file, `<?xml version="1.0" encoding="UTF-8"?><testsuite name="aegis" tests="${tests}" failures="${failures}">${cases}</testsuite>\n`);
    return { format, file };
  }

  if (format === "pdf") {
    const error = new Error("PDF output is not implemented in this dependency-free MVP. Generate HTML and render it to PDF in CI.");
    error.exitCode = 2;
    throw error;
  }

  throw new Error(`Unsupported report format: ${format}`);
}

export async function reportExists(cwd, relativePath) {
  return fileExists(path.resolve(cwd, relativePath));
}
