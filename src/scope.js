import path from "node:path";
import { EXECUTION_MODES } from "./config.js";
import { fileExists, readJson, workspacePath } from "./io.js";

export async function loadScope(cwd, scopeFile = "aegis.scope.json") {
  const absolutePath = workspacePath(cwd, scopeFile);
  if (!fileExists(absolutePath)) {
    const error = new Error(`scope file is required before this command can run: ${scopeFile}`);
    error.exitCode = 2;
    throw error;
  }
  return { scope: await readJson(absolutePath), scopePath: absolutePath };
}

export function isProductionEnvironment(environment) {
  return ["production", "prod", "production_passive_only"].includes(String(environment || "").toLowerCase());
}

export function assertModeAllowed(scope, mode, { manualApproval = false } = {}) {
  const modeConfig = EXECUTION_MODES[mode];
  if (!modeConfig) {
    throw new Error(`Unsupported execution mode: ${mode}`);
  }

  if (isProductionEnvironment(scope.environment) && mode !== "passive") {
    throw new Error(`Production environment only allows passive mode by default. Requested mode: ${mode}`);
  }

  if (modeConfig.requiresManualApproval && !manualApproval) {
    throw new Error(`Mode ${mode} requires explicit manual approval (--manual-approval).`);
  }

  if (scope.safety?.production_active_scan && isProductionEnvironment(scope.environment)) {
    throw new Error("production_active_scan must remain false unless a separate approval workflow is implemented.");
  }

  if (scope.safety?.destructive_tests || scope.safety?.brute_force || scope.safety?.data_exfiltration || scope.safety?.persistence) {
    throw new Error("Scope safety flags enable disallowed behavior. Disable destructive/brute-force/exfiltration/persistence flags.");
  }
}

export function assertAuthorization(scope, now = new Date()) {
  if (!scope.authorization) {
    throw new Error("authorization block is required in aegis.scope.json");
  }
  if (!scope.authorization.owner) {
    throw new Error("authorization.owner is required");
  }
  if (!scope.authorization.proof_type) {
    throw new Error("authorization.proof_type is required");
  }
  if (!scope.authorization.expires_at) {
    throw new Error("authorization.expires_at is required");
  }

  const expiry = new Date(`${scope.authorization.expires_at}T23:59:59.999Z`);
  if (Number.isNaN(expiry.getTime())) {
    throw new Error("authorization.expires_at must be a valid YYYY-MM-DD date");
  }
  if (expiry < now) {
    throw new Error(`authorization expired on ${scope.authorization.expires_at}`);
  }
}

export function getTargetConfig(scope, target) {
  const targetConfig = scope.targets?.[target];
  if (!targetConfig) {
    throw new Error(`Target ${target} is not defined in scope`);
  }
  if (!targetConfig.enabled) {
    throw new Error(`Target ${target} is disabled in scope`);
  }
  return targetConfig;
}

function normalizeHost(hostname) {
  return String(hostname || "").toLowerCase().replace(/\.$/, "");
}

function hostMatches(allowedHost, actualHost) {
  const allowed = normalizeHost(allowedHost);
  const actual = normalizeHost(actualHost);
  if (allowed === actual) {
    return true;
  }
  if (allowed.startsWith("*.")) {
    const suffix = allowed.slice(1);
    return actual.endsWith(suffix) && actual.length > suffix.length;
  }
  return false;
}

function globToRegExp(glob) {
  const escaped = String(glob)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

function pathAllowed(pathname, allowedPaths = ["/*"], deniedPaths = []) {
  const denied = deniedPaths.some((pattern) => globToRegExp(pattern).test(pathname));
  if (denied) {
    return false;
  }
  return allowedPaths.some((pattern) => globToRegExp(pattern).test(pathname));
}

function assertDiscoveryConfig(target, targetConfig) {
  const discovery = targetConfig.discovery;
  if (!discovery || discovery.enabled === false) {
    return;
  }

  const maxDepth = Number(discovery.max_depth ?? 2);
  const maxPages = Number(discovery.max_pages ?? 30);
  if (!Number.isFinite(maxDepth) || maxDepth < 0 || maxDepth > 5) {
    throw new Error(`Target ${target} discovery.max_depth must be between 0 and 5`);
  }
  if (!Number.isFinite(maxPages) || maxPages < 1 || maxPages > 200) {
    throw new Error(`Target ${target} discovery.max_pages must be between 1 and 200`);
  }
  if (discovery.submit_forms) {
    throw new Error(`Target ${target} discovery.submit_forms is not allowed by the default safety policy`);
  }
}

export function assertUrlInScope(scope, target, urlValue) {
  const targetConfig = getTargetConfig(scope, target);
  const parsed = new URL(urlValue);
  const allowedHosts = targetConfig.allowed_hosts || [];

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Only http and https targets are supported: ${urlValue}`);
  }
  if (!allowedHosts.some((allowedHost) => hostMatches(allowedHost, parsed.hostname))) {
    throw new Error(`Host ${parsed.hostname} is outside allowed_hosts for ${target}`);
  }
  if (!pathAllowed(parsed.pathname || "/", targetConfig.allowed_paths, targetConfig.denied_paths)) {
    throw new Error(`Path ${parsed.pathname || "/"} is outside allowed_paths or matches denied_paths for ${target}`);
  }
  return parsed;
}

export function targetBaseUrl(scope, target) {
  const targetConfig = getTargetConfig(scope, target);
  if (!targetConfig.base_url) {
    throw new Error(`Target ${target} does not have a base_url`);
  }
  return targetConfig.base_url;
}

export async function verifyScope(cwd, options = {}) {
  const { scope, scopePath } = await loadScope(cwd, options.scopeFile);
  assertAuthorization(scope);
  const mode = options.mode || "passive";
  assertModeAllowed(scope, mode, { manualApproval: options.manualApproval });

  const checks = [];
  for (const [target, targetConfig] of Object.entries(scope.targets || {})) {
    if (!targetConfig.enabled || !targetConfig.base_url) {
      continue;
    }
    assertUrlInScope(scope, target, targetConfig.base_url);
    assertDiscoveryConfig(target, targetConfig);
    checks.push({ target, base_url: targetConfig.base_url, status: "in_scope" });
  }

  if (options.url) {
    assertUrlInScope(scope, options.target || "frontend", options.url);
    checks.push({ target: options.target || "frontend", url: options.url, status: "in_scope" });
  }

  return {
    scopePath: path.relative(cwd, scopePath),
    project: scope.project,
    environment: scope.environment,
    mode,
    authorization_owner: scope.authorization.owner,
    authorization_expires_at: scope.authorization.expires_at,
    checks
  };
}
