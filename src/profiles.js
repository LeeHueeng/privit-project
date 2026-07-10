export const TRAINING_PROFILES = [
  {
    id: "baseline_web",
    label: "Baseline Web Application",
    description: "General web application coverage for teams starting from a neutral baseline.",
    safe_modes: ["passive", "ci", "safe_active"],
    target_focus: ["frontend", "backend_api", "ci_cd"],
    priority_categories: [
      "governance_scope_policy",
      "asset_inventory_passive_discovery",
      "security_headers_tls_cors",
      "session_cookie_token",
      "frontend_browser_runtime",
      "logging_monitoring_error_handling"
    ],
    denied_path_hints: ["/admin/delete/*", "/debug/*", "/internal/*"],
    auth_roles: ["anonymous", "user", "admin"],
    evidence_focus: ["headers", "routes", "forms", "console logs", "redacted responses"],
    risk_questions: [
      "Are all tested assets explicitly in scope?",
      "Are authentication and session boundaries visible without touching production data?",
      "Are reports redacted before sharing?"
    ]
  },
  {
    id: "saas_b2b",
    label: "B2B SaaS / Multi-tenant",
    description: "Tenant isolation, role boundaries, admin surfaces, billing metadata, and integration settings.",
    safe_modes: ["passive", "authenticated", "ci"],
    target_focus: ["frontend", "backend_api", "ci_cd"],
    priority_categories: [
      "backend_api_authorization",
      "backend_api_authentication",
      "session_cookie_token",
      "business_logic_safe_checks",
      "privacy_data_minimization",
      "ci_cd_secret_release"
    ],
    denied_path_hints: ["/tenants/*/delete/*", "/billing/live/*", "/integrations/secrets/*"],
    auth_roles: ["tenant_viewer", "tenant_admin", "support_readonly", "platform_admin"],
    evidence_focus: ["role matrix", "tenant ids", "redacted API metadata", "audit log presence"],
    risk_questions: [
      "Can one tenant see another tenant's metadata?",
      "Are admin and support roles separated?",
      "Are integration secrets kept out of reports and client bundles?"
    ]
  },
  {
    id: "ecommerce_marketplace",
    label: "E-commerce / Marketplace",
    description: "Checkout, seller workflows, price integrity, inventory transitions, coupons, and order privacy.",
    safe_modes: ["passive", "safe_active", "ci"],
    target_focus: ["frontend", "backend_api", "ci_cd"],
    priority_categories: [
      "business_logic_safe_checks",
      "backend_api_input_validation",
      "session_cookie_token",
      "security_headers_tls_cors",
      "privacy_data_minimization",
      "logging_monitoring_error_handling"
    ],
    denied_path_hints: ["/payments/live/*", "/orders/*/refund/*", "/payouts/*", "/inventory/write/*"],
    auth_roles: ["buyer_test", "seller_test", "support_readonly", "catalog_admin"],
    evidence_focus: ["workflow state", "price fields", "order metadata", "redacted payment references"],
    risk_questions: [
      "Are price and discount decisions validated server-side?",
      "Are live payment and payout paths excluded from active checks?",
      "Can order data be viewed only by the correct role?"
    ]
  },
  {
    id: "fintech_payments",
    label: "Fintech / Payments",
    description: "High-sensitivity passive-first coverage for payments, wallet, ledger, KYC, and audit evidence.",
    safe_modes: ["passive", "ci", "db_audit"],
    target_focus: ["frontend", "backend_api", "database", "ci_cd"],
    priority_categories: [
      "governance_scope_policy",
      "security_headers_tls_cors",
      "backend_api_authorization",
      "privacy_data_minimization",
      "database_readonly_audit",
      "ci_cd_secret_release",
      "supply_chain_sast_sca_container_iac"
    ],
    denied_path_hints: ["/payments/live/*", "/wallet/transfer/*", "/ledger/export/*", "/kyc/documents/*"],
    auth_roles: ["customer_test", "ops_readonly", "risk_readonly", "auditor_readonly"],
    evidence_focus: ["authorization proof", "redacted payment ids", "audit trail", "read-only DB settings"],
    risk_questions: [
      "Are money movement paths excluded unless separately authorized?",
      "Are audit logs present for sensitive state changes?",
      "Are payment identifiers redacted in artifacts?"
    ],
    high_sensitivity: true
  },
  {
    id: "healthcare_privacy",
    label: "Healthcare / Privacy",
    description: "Patient privacy, appointment workflows, consent boundaries, portal access, and auditability.",
    safe_modes: ["passive", "authenticated", "ci", "db_audit"],
    target_focus: ["frontend", "backend_api", "database", "ci_cd"],
    priority_categories: [
      "privacy_data_minimization",
      "backend_api_authorization",
      "session_cookie_token",
      "database_readonly_audit",
      "logging_monitoring_error_handling",
      "security_headers_tls_cors"
    ],
    denied_path_hints: ["/patients/export/*", "/medical-records/export/*", "/prescriptions/write/*", "/clinical/delete/*"],
    auth_roles: ["patient_test", "clinician_test", "staff_readonly", "privacy_auditor"],
    evidence_focus: ["consent state", "redacted patient ids", "audit logs", "role matrix"],
    risk_questions: [
      "Is patient data minimized in frontend and API responses?",
      "Are clinician, staff, and patient roles separated?",
      "Can audit evidence be reviewed without exposing clinical data?"
    ],
    high_sensitivity: true
  },
  {
    id: "public_education",
    label: "Public Sector / Education",
    description: "Citizen or student portals, document workflows, accessibility-adjacent evidence, and procurement-safe CI.",
    safe_modes: ["passive", "ci", "authenticated"],
    target_focus: ["frontend", "backend_api", "ci_cd"],
    priority_categories: [
      "asset_inventory_passive_discovery",
      "security_headers_tls_cors",
      "privacy_data_minimization",
      "backend_api_authorization",
      "ci_cd_secret_release",
      "cloud_kubernetes_config_audit"
    ],
    denied_path_hints: ["/students/export/*", "/citizens/export/*", "/documents/delete/*", "/grades/write/*"],
    auth_roles: ["public_user", "student_test", "staff_readonly", "case_worker_test"],
    evidence_focus: ["public routes", "document metadata", "redacted identifiers", "configuration snapshots"],
    risk_questions: [
      "Are public and authenticated portals clearly separated?",
      "Are student or citizen identifiers redacted?",
      "Are cloud and CI settings reviewable without production secrets?"
    ],
    high_sensitivity: true
  },
  {
    id: "internal_admin",
    label: "Internal Admin / Backoffice",
    description: "Backoffice role separation, support tooling, audit trails, admin routes, and safe operational checks.",
    safe_modes: ["passive", "authenticated", "ci", "db_audit"],
    target_focus: ["frontend", "backend_api", "database", "ci_cd"],
    priority_categories: [
      "backend_api_authorization",
      "backend_api_authentication",
      "database_readonly_audit",
      "logging_monitoring_error_handling",
      "business_logic_safe_checks",
      "ci_cd_secret_release"
    ],
    denied_path_hints: ["/admin/delete/*", "/users/*/impersonate/*", "/ops/write/*", "/exports/full/*"],
    auth_roles: ["support_readonly", "support_manager", "ops_readonly", "admin_test"],
    evidence_focus: ["admin routes", "role matrix", "audit events", "redacted operational metadata"],
    risk_questions: [
      "Can support roles view only approved operational data?",
      "Are destructive admin paths excluded by default?",
      "Are impersonation and export workflows separately authorized?"
    ]
  },
  {
    id: "api_platform",
    label: "API Platform / Developer Portal",
    description: "OpenAPI hygiene, API keys, rate-limit metadata, developer docs, webhooks, and integration boundaries.",
    safe_modes: ["passive", "safe_active", "authenticated", "ci"],
    target_focus: ["backend_api", "frontend", "ci_cd"],
    priority_categories: [
      "backend_api_authentication",
      "backend_api_authorization",
      "backend_api_input_validation",
      "ci_cd_secret_release",
      "supply_chain_sast_sca_container_iac",
      "logging_monitoring_error_handling"
    ],
    denied_path_hints: ["/api-keys/live/*", "/webhooks/replay/*", "/integrations/secrets/*", "/rate-limit/reset/*"],
    auth_roles: ["developer_test", "partner_test", "platform_admin", "security_readonly"],
    evidence_focus: ["OpenAPI metadata", "API key redaction", "webhook headers", "rate-limit headers"],
    risk_questions: [
      "Are API keys and webhook secrets redacted everywhere?",
      "Do public docs match actual authorization boundaries?",
      "Are partner and internal APIs separated?"
    ]
  },
  {
    id: "media_community",
    label: "Media / Community Platform",
    description: "User-generated content, moderation queues, profile privacy, notification flows, and media metadata.",
    safe_modes: ["passive", "safe_active", "authenticated", "ci"],
    target_focus: ["frontend", "backend_api", "ci_cd"],
    priority_categories: [
      "frontend_browser_runtime",
      "backend_api_input_validation",
      "backend_api_authorization",
      "privacy_data_minimization",
      "logging_monitoring_error_handling",
      "security_headers_tls_cors"
    ],
    denied_path_hints: ["/moderation/delete/*", "/media/private/*/download", "/notifications/send/*"],
    auth_roles: ["member_test", "creator_test", "moderator_test", "trust_safety_readonly"],
    evidence_focus: ["content routes", "profile privacy metadata", "moderation state", "redacted media ids"],
    risk_questions: [
      "Are private profiles and media metadata protected?",
      "Are moderation actions separately authorized?",
      "Are user-generated content checks non-destructive?"
    ]
  }
];

export function listProfiles() {
  return TRAINING_PROFILES.map((profile) => ({
    id: profile.id,
    label: profile.label,
    description: profile.description,
    safe_modes: profile.safe_modes,
    target_focus: profile.target_focus
  }));
}

export function getProfile(profileId) {
  if (!profileId) {
    return undefined;
  }
  return TRAINING_PROFILES.find((profile) => profile.id === profileId);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function mergeDeniedPaths(target, deniedPathHints = []) {
  if (!target) {
    return;
  }
  target.denied_paths = unique([...(target.denied_paths || []), ...deniedPathHints]);
}

export function applyTrainingProfile(scope, profileId) {
  const profile = getProfile(profileId);
  if (!profile) {
    throw new Error(`Unknown training profile: ${profileId}`);
  }

  const nextScope = structuredClone(scope);
  nextScope.training_profile = {
    id: profile.id,
    label: profile.label,
    description: profile.description,
    safe_modes: profile.safe_modes,
    target_focus: profile.target_focus,
    priority_categories: profile.priority_categories,
    auth_roles: profile.auth_roles,
    evidence_focus: profile.evidence_focus,
    risk_questions: profile.risk_questions
  };

  mergeDeniedPaths(nextScope.targets?.frontend, profile.denied_path_hints);
  mergeDeniedPaths(nextScope.targets?.backend_api, profile.denied_path_hints);

  if (nextScope.targets?.frontend?.discovery) {
    nextScope.targets.frontend.discovery.login_indicators = unique([
      ...(nextScope.targets.frontend.discovery.login_indicators || []),
      "portal",
      "dashboard",
      "account",
      "console",
      "admin",
      "support"
    ]);
  }

  if (profile.high_sensitivity) {
    nextScope.safety.max_rps = Math.min(nextScope.safety?.max_rps ?? 2, 1);
    nextScope.safety.max_concurrency = Math.min(nextScope.safety?.max_concurrency ?? 3, 2);
  }

  nextScope.safety.profile_guardrails = [
    "profile changes prioritization and guardrails only",
    "authorization and allowlists still control every target",
    "destructive and exfiltration behavior remains disabled"
  ];

  return nextScope;
}
