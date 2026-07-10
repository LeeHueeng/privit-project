import path from "node:path";
import { CATEGORY_DISTRIBUTION, TOOL_ADAPTERS } from "./config.js";
import { ensureDir, fileExists, writeText } from "./io.js";

export const DEFAULT_CATALOG_FILE = "catalog/security-checks.jsonl";

function slugUpper(value) {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function titleCase(value) {
  return String(value)
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function evidenceForCategory(category) {
  if (category.includes("attack_emulation")) {
    return ["control_evidence", "log_metadata", "configuration_snapshot", "redacted_sample"];
  }
  if (category.includes("frontend")) {
    return ["screenshot", "console_log", "dom_snapshot", "response_metadata"];
  }
  if (category.includes("supply_chain") || category.includes("ci_cd") || category.includes("cloud")) {
    return ["static_analysis_result", "sbom", "config_snapshot", "logs"];
  }
  if (category.includes("database")) {
    return ["config_snapshot", "logs"];
  }
  return ["request_metadata", "response_metadata", "headers", "logs"];
}

function requiresAuth(category, executionMode) {
  return executionMode === "authenticated" || category.includes("session") || category.includes("authorization");
}

export function generateCatalogEntries() {
  const entries = [];
  for (const categoryConfig of CATEGORY_DISTRIBUTION) {
    for (let index = 1; index <= categoryConfig.plannedChecks; index += 1) {
      const example = categoryConfig.examples[(index - 1) % categoryConfig.examples.length];
      const id = `AEGIS-${slugUpper(categoryConfig.category)}-${String(index).padStart(4, "0")}`;
      const requiresManualApproval = ["authenticated", "db_audit"].includes(categoryConfig.executionMode);

      entries.push({
        id,
        title: `${titleCase(categoryConfig.category)} safe verification ${index}`,
        category: categoryConfig.category,
        target_type: categoryConfig.targetType,
        execution_mode: categoryConfig.executionMode,
        risk_if_found: categoryConfig.risk,
        confidence_default: index % 5 === 0 ? "medium" : "high",
        requires_auth: requiresAuth(categoryConfig.category, categoryConfig.executionMode),
        requires_manual_approval: requiresManualApproval,
        destructive: false,
        tool_adapter: categoryConfig.adapter,
        evidence_types: evidenceForCategory(categoryConfig.category),
        purpose: `Verify ${example} using approved, non-destructive evidence collection.`,
        preconditions: ["scope_verified", "authorization_not_expired", "target_allowlisted"],
        remediation_template: `Review and harden ${example}. Prefer configuration fixes, least privilege, and clear audit evidence.`,
        mapped_standards: categoryConfig.standards
      });
    }
  }
  return entries;
}

export function catalogSummary(entries) {
  const byCategory = new Map();
  for (const entry of entries) {
    byCategory.set(entry.category, (byCategory.get(entry.category) || 0) + 1);
  }
  return {
    total: entries.length,
    categories: Object.fromEntries([...byCategory.entries()].sort())
  };
}

export async function writeCatalog(cwd, file = DEFAULT_CATALOG_FILE) {
  const entries = generateCatalogEntries();
  const absolutePath = path.resolve(cwd, file);
  await ensureDir(path.dirname(absolutePath));
  const lines = entries.map((entry) => JSON.stringify(entry)).join("\n");
  await writeText(absolutePath, `${lines}\n`);
  return { file, absolutePath, ...catalogSummary(entries) };
}

export async function ensureCatalog(cwd, file = DEFAULT_CATALOG_FILE) {
  const absolutePath = path.resolve(cwd, file);
  if (!fileExists(absolutePath)) {
    return writeCatalog(cwd, file);
  }
  return { file, absolutePath, existed: true };
}

export async function loadCatalog(cwd, file = DEFAULT_CATALOG_FILE) {
  await ensureCatalog(cwd, file);
  const raw = await import("node:fs/promises").then((fs) => fs.readFile(path.resolve(cwd, file), "utf8"));
  return raw
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid catalog JSONL at line ${index + 1}: ${error.message}`);
      }
    });
}

function profilePriority(entry, priorityCategories = []) {
  const index = priorityCategories.indexOf(entry.category);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function selectChecks(entries, { mode = "passive", target, includeManualApproval = false, limit = 100, priorityCategories = [] } = {}) {
  const allowedAdapters = new Set(Object.keys(TOOL_ADAPTERS));
  const candidates = [];
  for (const entry of entries) {
    if (target && entry.target_type !== target) {
      continue;
    }
    if (entry.execution_mode !== mode) {
      continue;
    }
    if (entry.destructive) {
      continue;
    }
    if (entry.requires_manual_approval && !includeManualApproval) {
      continue;
    }
    if (!allowedAdapters.has(entry.tool_adapter)) {
      continue;
    }
    candidates.push(entry);
  }
  return candidates
    .sort((left, right) => profilePriority(left, priorityCategories) - profilePriority(right, priorityCategories))
    .slice(0, limit);
}
