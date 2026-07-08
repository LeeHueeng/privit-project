import path from "node:path";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileExists, ensureDir, readJson, writeJson, writeText } from "./io.js";
import { redact } from "./redaction.js";
import { assertModeAllowed, assertUrlInScope, loadScope, targetBaseUrl, verifyScope } from "./scope.js";
import { createPlan, loadPlan } from "./planner.js";

const TRANSPARENT_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

function severityForHeader(headerName) {
  if (headerName === "content-security-policy") {
    return "medium";
  }
  return "low";
}

async function safeFetchHeaders(scope, target, scanDir, findings) {
  const url = targetBaseUrl(scope, target);
  assertUrlInScope(scope, target, url);

  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
    headers: { "User-Agent": "AegisCLI/0.1 passive-header-check" }
  });
  const headers = Object.fromEntries(response.headers.entries());
  const metadata = redact({
    url,
    status: response.status,
    headers
  });
  await writeJson(path.join(scanDir, `${target}-response-metadata.json`), metadata);

  for (const requiredHeader of ["content-security-policy", "strict-transport-security", "x-content-type-options"]) {
    if (!response.headers.has(requiredHeader)) {
      findings.push({
        target_type: target,
        asset: url,
        category: "security_headers_tls_cors",
        title: `Missing ${requiredHeader} header`,
        severity: severityForHeader(requiredHeader),
        confidence: "medium",
        evidence: {
          summary: `${requiredHeader} was not present in the passive response header check.`,
          artifact_paths: [path.relative(process.cwd(), path.join(scanDir, `${target}-response-metadata.json`))],
          redacted: true
        },
        impact: "Missing browser security headers can weaken client-side protections.",
        safe_reproduction: "Run a passive header request against the in-scope base URL.",
        recommendation: [`Configure ${requiredHeader} according to the application risk profile.`],
        mapped_standards: ["OWASP_ASVS", "OWASP_WSTG"]
      });
    }
  }
  return metadata;
}

function simulatedConsoleFinding(scope, cwd, scanDir) {
  return {
    target_type: "frontend",
    asset: scope.targets?.frontend?.base_url || "frontend",
    category: "frontend_browser_runtime",
    title: "Console error captured",
    severity: "low",
    confidence: "high",
    evidence: {
      summary: "A console error was captured and stored with a screenshot artifact.",
      artifact_paths: [
        path.relative(cwd, path.join(scanDir, "artifacts", "console_error.log")),
        path.relative(cwd, path.join(scanDir, "artifacts", "console_error.png"))
      ],
      redacted: true
    },
    impact: "Console errors can indicate broken flows or security policy violations.",
    safe_reproduction: "Run the frontend check and inspect captured browser logs.",
    recommendation: ["Investigate the browser console stack and fix the underlying client error."],
    mapped_standards: ["OWASP_WSTG"]
  };
}

async function runBuiltInChecks(cwd, scope, plan, scanDir, options) {
  const findings = [];
  const observations = [];

  observations.push({
    check: "scope_guard",
    status: "passed",
    detail: "Scope, authorization, safety flags, and execution mode were verified before execution."
  });

  if (options.simulateConsoleError) {
    await recordFrontendAnomaly(cwd, scanDir, "console_error", {
      message: "Simulated console error for capture pipeline verification."
    });
    findings.push(simulatedConsoleFinding(scope, cwd, scanDir));
  }

  if (options.dryRun) {
    observations.push({
      check: "dry_run",
      status: "planned_only",
      detail: "No target requests or external tool adapters were executed."
    });
    return { findings, observations };
  }

  if ((plan.target === "frontend" || plan.target === "all") && scope.targets?.frontend?.enabled && plan.mode === "passive") {
    try {
      const metadata = await safeFetchHeaders(scope, "frontend", scanDir, findings);
      observations.push({
        check: "frontend_passive_headers",
        status: "completed",
        response_status: metadata.status
      });
    } catch (error) {
      observations.push({
        check: "frontend_passive_headers",
        status: "not_completed",
        detail: error.message
      });
    }
  }

  if ((plan.target === "backend_api" || plan.target === "all") && scope.targets?.backend_api?.enabled) {
    const openapiFile = path.resolve(cwd, scope.targets.backend_api.openapi_file || "openapi.yaml");
    observations.push({
      check: "openapi_inventory",
      status: fileExists(openapiFile) ? "ready" : "missing_openapi_file",
      detail: path.relative(cwd, openapiFile)
    });
  }

  if ((plan.mode === "ci" || plan.target === "ci_cd") && scope.targets?.ci_cd?.enabled) {
    const lockfiles = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "go.sum", "Cargo.lock", "requirements.txt"].filter((file) =>
      fileExists(path.resolve(cwd, file))
    );
    observations.push({
      check: "supply_chain_inventory",
      status: "completed",
      lockfiles
    });
  }

  return { findings, observations };
}

export async function recordFrontendAnomaly(cwd, scanDir, type, details) {
  const artifactDir = path.join(scanDir, "artifacts");
  await ensureDir(artifactDir);
  const safeDetails = redact(details);
  await writeText(path.join(artifactDir, `${type}.log`), `${JSON.stringify(safeDetails, null, 2)}\n`);
  await writeText(path.join(artifactDir, `${type}.dom.html`), "<!doctype html><title>Aegis anomaly snapshot</title><body data-redacted=\"true\"></body>\n");
  await import("node:fs/promises").then((fs) => fs.writeFile(path.join(artifactDir, `${type}.png`), Buffer.from(TRANSPARENT_PNG_BASE64, "base64")));
  return {
    type,
    artifact_paths: [
      path.relative(cwd, path.join(artifactDir, `${type}.log`)),
      path.relative(cwd, path.join(artifactDir, `${type}.dom.html`)),
      path.relative(cwd, path.join(artifactDir, `${type}.png`))
    ]
  };
}

async function appendFindings(cwd, scanId, scope, findings) {
  const findingsPath = path.resolve(cwd, ".aegis/findings.json");
  let existing = [];
  if (fileExists(findingsPath)) {
    existing = await readJson(findingsPath);
  }
  const now = new Date().toISOString();
  const normalized = findings.map((finding, index) => ({
    id: `FIND-${now.slice(0, 4)}-${String(existing.length + index + 1).padStart(6, "0")}`,
    project: scope.project,
    environment: scope.environment,
    scan_id: scanId,
    status: "new",
    created_at: now,
    updated_at: now,
    ...finding
  }));
  await writeJson(findingsPath, [...existing, ...normalized]);
  return normalized;
}

export async function runPlan(cwd, options = {}) {
  const mode = options.mode || "passive";
  const target = options.target;
  const manualApproval = Boolean(options.manualApproval);
  const { scope } = await loadScope(cwd, options.scopeFile);
  assertModeAllowed(scope, mode, { manualApproval });
  await verifyScope(cwd, { scopeFile: options.scopeFile, mode, manualApproval, target });

  let plan;
  try {
    plan = await loadPlan(cwd, options.planFile);
    if (plan.mode !== mode || (target && plan.target !== target && plan.target !== "all")) {
      plan = await createPlan(cwd, { ...options, mode, target });
    }
  } catch (error) {
    if (error && error.code !== "ENOENT" && !String(error.message).includes("Required file not found")) {
      throw error;
    }
    plan = await createPlan(cwd, { ...options, mode, target });
  }

  const scanId = `scan-${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`;
  const scanDir = path.resolve(cwd, ".aegis/scans", scanId);
  await ensureDir(scanDir);

  const { findings, observations } = await runBuiltInChecks(cwd, scope, plan, scanDir, options);
  const normalizedFindings = await appendFindings(cwd, scanId, scope, findings);
  const result = {
    scan_id: scanId,
    project: scope.project,
    environment: scope.environment,
    mode,
    target: target || plan.target || "all",
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    selected_check_count: plan.selected_checks.length,
    executed_check_count: observations.length,
    observations,
    findings: normalizedFindings
  };
  await writeJson(path.join(scanDir, "results.json"), result);
  await writeJson(path.resolve(cwd, ".aegis/latest-scan.json"), result);
  return result;
}

export async function listFindings(cwd) {
  const findingsPath = path.resolve(cwd, ".aegis/findings.json");
  if (!fileExists(findingsPath)) {
    return [];
  }
  return readJson(findingsPath);
}

export async function showFinding(cwd, id) {
  const findings = await listFindings(cwd);
  return findings.find((finding) => finding.id === id);
}

export async function latestScan(cwd) {
  const latestPath = path.resolve(cwd, ".aegis/latest-scan.json");
  if (!fileExists(latestPath)) {
    return null;
  }
  try {
    return await readJson(latestPath);
  } catch {
    const raw = await readFile(latestPath, "utf8");
    return { raw };
  }
}
