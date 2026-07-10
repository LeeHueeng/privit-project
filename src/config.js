import { applyTrainingProfile } from "./profiles.js";

export const VERSION = "0.1.0";

export const SUPPORTED_LANGUAGE_CONFIG = {
  default_locale: "ko-KR",
  fallback_locale: "en-US",
  supported_locales: ["ko-KR", "ja-JP", "zh-CN", "en-US"],
  aliases: {
    korean: "ko-KR",
    japanese: "ja-JP",
    chinese: "zh-CN",
    english: "en-US"
  }
};

export const EXECUTION_MODES = {
  passive: {
    safeForProduction: true,
    requiresManualApproval: false,
    description: "Minimal requests and passive metadata checks."
  },
  safe_active: {
    safeForProduction: false,
    requiresManualApproval: false,
    description: "Non-destructive validation for staging or development."
  },
  authenticated: {
    safeForProduction: "passive_only",
    requiresManualApproval: true,
    description: "Role-aware tests with approved test accounts."
  },
  ci: {
    safeForProduction: true,
    requiresManualApproval: false,
    description: "Static, supply-chain, SBOM, IaC, and secret scanning gates."
  },
  db_audit: {
    safeForProduction: false,
    requiresManualApproval: true,
    description: "Read-only database configuration audit."
  }
};

export const TOOL_ADAPTERS = {
  scope_guard_adapter: {
    tool: "Aegis Scope Guard",
    allowedModes: ["passive", "safe_active", "authenticated", "ci", "db_audit"]
  },
  playwright_adapter: {
    tool: "Playwright",
    allowedModes: ["passive", "safe_active", "authenticated", "ci"]
  },
  semgrep_adapter: {
    tool: "Semgrep",
    allowedModes: ["ci", "local_static_analysis"]
  },
  trivy_adapter: {
    tool: "Trivy",
    allowedModes: ["ci", "local_static_analysis"]
  },
  syft_adapter: {
    tool: "Syft",
    allowedModes: ["ci", "local_static_analysis"]
  },
  zap_adapter: {
    tool: "OWASP ZAP",
    allowedModes: ["passive", "safe_active", "authenticated"]
  },
  nuclei_adapter: {
    tool: "Nuclei",
    allowedModes: ["passive", "safe_active"],
    policy: {
      templateAllowlistRequired: true,
      unsignedCodeTemplatesBlocked: true,
      destructiveTemplatesBlocked: true,
      rateLimitRequired: true
    }
  },
  db_readonly_adapter: {
    tool: "Internal DB Audit",
    allowedModes: ["db_audit"],
    policy: {
      writeQueriesBlocked: true,
      schemaMutationBlocked: true,
      dataDumpBlocked: true
    }
  }
};

export const CATEGORY_DISTRIBUTION = [
  {
    category: "governance_scope_policy",
    plannedChecks: 80,
    targetType: "ci_cd",
    executionMode: "passive",
    adapter: "scope_guard_adapter",
    risk: "high",
    standards: ["NIST_SSDF", "OWASP_ASVS"],
    examples: [
      "scope file exists",
      "authorization expiry is valid",
      "production active scan is blocked",
      "host and path allowlists are enforced"
    ]
  },
  {
    category: "asset_inventory_passive_discovery",
    plannedChecks: 140,
    targetType: "frontend",
    executionMode: "passive",
    adapter: "scope_guard_adapter",
    risk: "low",
    standards: ["OWASP_WSTG"],
    examples: ["sitemap presence", "robots policy", "public OpenAPI document", "public admin surface"]
  },
  {
    category: "frontend_browser_runtime",
    plannedChecks: 180,
    targetType: "frontend",
    executionMode: "passive",
    adapter: "playwright_adapter",
    risk: "medium",
    standards: ["OWASP_WSTG", "OWASP_ASVS"],
    examples: ["console error capture", "security policy event capture", "mixed content detection", "route state check"]
  },
  {
    category: "frontend_static_bundle",
    plannedChecks: 140,
    targetType: "frontend",
    executionMode: "ci",
    adapter: "trivy_adapter",
    risk: "medium",
    standards: ["OWASP_SCVS", "CWE"],
    examples: ["source map exposure", "client-side secret pattern", "dangerous client config", "lockfile hygiene"]
  },
  {
    category: "backend_api_authentication",
    plannedChecks: 160,
    targetType: "backend_api",
    executionMode: "authenticated",
    adapter: "zap_adapter",
    risk: "high",
    standards: ["OWASP_API_TOP_10_2023", "OWASP_ASVS"],
    examples: ["auth-required endpoint classification", "session expiry", "token storage review", "logout state"]
  },
  {
    category: "backend_api_authorization",
    plannedChecks: 220,
    targetType: "backend_api",
    executionMode: "authenticated",
    adapter: "zap_adapter",
    risk: "high",
    standards: ["OWASP_API_TOP_10_2023", "OWASP_ASVS", "CWE"],
    examples: ["role matrix comparison", "role mismatch", "ownership check review", "admin route access policy"]
  },
  {
    category: "backend_api_input_validation",
    plannedChecks: 200,
    targetType: "backend_api",
    executionMode: "safe_active",
    adapter: "zap_adapter",
    risk: "medium",
    standards: ["OWASP_API_TOP_10_2023", "CWE"],
    examples: ["input length policy", "type validation", "server error exposure", "non-destructive canary handling"]
  },
  {
    category: "session_cookie_token",
    plannedChecks: 150,
    targetType: "frontend",
    executionMode: "passive",
    adapter: "playwright_adapter",
    risk: "medium",
    standards: ["OWASP_ASVS", "CWE"],
    examples: ["Secure cookie", "HttpOnly cookie", "SameSite policy", "refresh token exposure"]
  },
  {
    category: "security_headers_tls_cors",
    plannedChecks: 120,
    targetType: "frontend",
    executionMode: "passive",
    adapter: "scope_guard_adapter",
    risk: "medium",
    standards: ["OWASP_WSTG", "OWASP_ASVS"],
    examples: ["CSP header", "HSTS header", "CORS origin policy", "TLS certificate expiry"]
  },
  {
    category: "database_readonly_audit",
    plannedChecks: 140,
    targetType: "database",
    executionMode: "db_audit",
    adapter: "db_readonly_adapter",
    risk: "high",
    standards: ["NIST_SSDF", "CWE"],
    examples: ["read-only account", "shared account review", "excessive role", "DB TLS"]
  },
  {
    category: "supply_chain_sast_sca_container_iac",
    plannedChecks: 260,
    targetType: "ci_cd",
    executionMode: "ci",
    adapter: "trivy_adapter",
    risk: "high",
    standards: ["OWASP_SCVS", "NIST_SSDF", "CWE"],
    examples: ["SAST rules", "dependency vulnerability", "container vulnerability", "SBOM", "IaC misconfiguration"]
  },
  {
    category: "ci_cd_secret_release",
    plannedChecks: 150,
    targetType: "ci_cd",
    executionMode: "ci",
    adapter: "semgrep_adapter",
    risk: "high",
    standards: ["NIST_SSDF", "OWASP_SCVS"],
    examples: ["CI secret exposure pattern", "deployment privilege review", "PR security gate", "SARIF upload"]
  },
  {
    category: "business_logic_safe_checks",
    plannedChecks: 140,
    targetType: "backend_api",
    executionMode: "safe_active",
    adapter: "scope_guard_adapter",
    risk: "medium",
    standards: ["OWASP_ASVS", "OWASP_API_TOP_10_2023"],
    examples: ["server-side price validation", "duplicate request handling", "workflow state transition", "UI/API mismatch"]
  },
  {
    category: "logging_monitoring_error_handling",
    plannedChecks: 90,
    targetType: "backend_api",
    executionMode: "passive",
    adapter: "scope_guard_adapter",
    risk: "medium",
    standards: ["OWASP_ASVS", "CWE"],
    examples: ["stack trace exposure", "sensitive log review", "security event audit log", "error response standard"]
  },
  {
    category: "cloud_kubernetes_config_audit",
    plannedChecks: 180,
    targetType: "iac",
    executionMode: "ci",
    adapter: "trivy_adapter",
    risk: "high",
    standards: ["NIST_SSDF", "CWE"],
    examples: ["Kubernetes security context", "privileged container", "public bucket policy", "ingress TLS"]
  },
  {
    category: "privacy_data_minimization",
    plannedChecks: 80,
    targetType: "backend_api",
    executionMode: "passive",
    adapter: "scope_guard_adapter",
    risk: "medium",
    standards: ["OWASP_ASVS", "NIST_SSDF"],
    examples: ["unnecessary PII in response", "masking policy", "artifact PII redaction", "report redaction"]
  }
];

export const SENSITIVE_FIELDS = [
  "authorization",
  "cookie",
  "set-cookie",
  "access_token",
  "refresh_token",
  "id_token",
  "password",
  "api_key",
  "secret",
  "private_key",
  "email",
  "phone",
  "resident_id",
  "payment_card"
];

export function createDefaultScope(projectName = "aegis-project", environment = "local", profileId) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const scope = {
    project: projectName,
    environment,
    targets: {
      frontend: {
        enabled: true,
        base_url: "http://localhost:3000",
        allowed_hosts: ["localhost", "127.0.0.1"],
        allowed_paths: ["/*"],
        denied_paths: ["/payments/live/*", "/admin/delete/*"],
        discovery: {
          enabled: true,
          max_depth: 2,
          max_pages: 30,
          include_forms: true,
          follow_redirects: true,
          sitemap_paths: ["/robots.txt", "/sitemap.xml"],
          login_indicators: ["login", "signin", "sign-in", "auth", "session", "admin", "account"]
        }
      },
      backend_api: {
        enabled: false,
        base_url: "http://localhost:3000/api",
        openapi_file: "./openapi.yaml",
        allowed_hosts: ["localhost", "127.0.0.1"],
        allowed_paths: ["/*"],
        denied_paths: ["/admin/delete/*"]
      },
      database: {
        enabled: false,
        mode: "read_only_audit",
        connection_profile: "readonly-local-db"
      },
      ci_cd: {
        enabled: true,
        repository_root: "."
      }
    },
    authorization: {
      owner: "security@example.com",
      proof_type: "manual_approval_file",
      proof_file: "./aegis.auth.json",
      expires_at: expires
    },
    safety: {
      max_rps: 2,
      max_concurrency: 3,
      destructive_tests: false,
      brute_force: false,
      data_exfiltration: false,
      persistence: false,
      production_active_scan: false
    }
  };

  return profileId ? applyTrainingProfile(scope, profileId) : scope;
}

export function createDefaultPolicy() {
  return {
    mandatory_authorization: true,
    default_execution_mode: "passive",
    scope_file_required: true,
    ownership_verification_required: true,
    production_active_scan_default: false,
    llm_direct_shell_execution: false,
    tool_allowlist_required: true,
    secret_redaction_before_llm: true,
    human_approval_for_high_risk_actions: true,
    passive_site_discovery: {
      same_scope_only: true,
      no_form_submission: true,
      no_brute_force: true,
      max_depth_default: 2,
      max_pages_default: 30
    },
    localization: SUPPORTED_LANGUAGE_CONFIG,
    disallowed_capabilities: [
      "unauthorized_target_testing",
      "brute_force_login",
      "credential_stuffing",
      "privilege_escalation_automation",
      "webshell_or_backdoor_creation",
      "persistence_creation",
      "defense_evasion",
      "data_exfiltration",
      "destructive_production_db_testing",
      "llm_generated_direct_shell_execution"
    ],
    allowed_tool_adapters: Object.keys(TOOL_ADAPTERS)
  };
}
