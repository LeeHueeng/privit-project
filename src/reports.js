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

function renderHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = lines
    .map((line) => {
      if (line.startsWith("# ")) {
        return `<h1>${htmlEscape(line.slice(2))}</h1>`;
      }
      if (line.startsWith("## ")) {
        return `<h2>${htmlEscape(line.slice(3))}</h2>`;
      }
      if (line.startsWith("- ")) {
        return `<p>${htmlEscape(line)}</p>`;
      }
      if (line.startsWith("|")) {
        return `<pre>${htmlEscape(line)}</pre>`;
      }
      if (!line.trim()) {
        return "";
      }
      return `<p>${htmlEscape(line)}</p>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Aegis Security Report</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 40px; max-width: 1040px; line-height: 1.55; color: #1f2937; }
    h1, h2 { color: #111827; }
    pre { background: #f3f4f6; padding: 8px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
${html}
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
    await writeText(file, renderHtml(markdown));
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
