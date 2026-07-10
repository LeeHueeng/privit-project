export const ATTACK_EMULATION_PACKS = [
  {
    id: "recon_exposure_review",
    label: "Reconnaissance Exposure Review",
    description: "Passive review of public discovery, metadata, sitemap, robots, API docs, and accidental admin surface exposure.",
    allowed_modes: ["passive", "ci"],
    target_focus: ["frontend", "backend_api", "ci_cd"],
    tactics: ["TA0043 Reconnaissance"],
    techniques: ["T1595 Active Scanning", "T1592 Gather Victim Host Information", "T1598 Phishing for Information"],
    priority_categories: ["attack_emulation_recon_exposure", "asset_inventory_passive_discovery", "security_headers_tls_cors"],
    evidence_focus: ["public routes", "robots and sitemap", "metadata", "redacted API documentation"],
    blocked_actions: ["active internet-wide scanning", "social engineering", "credential collection"]
  },
  {
    id: "initial_access_hardening",
    label: "Initial Access Hardening",
    description: "Safe checks for exposed apps, phishing readiness evidence, external service policy, and supply-chain entry points.",
    allowed_modes: ["passive", "ci"],
    target_focus: ["frontend", "backend_api", "ci_cd"],
    tactics: ["TA0001 Initial Access"],
    techniques: ["T1190 Exploit Public-Facing Application", "T1566 Phishing", "T1195 Supply Chain Compromise"],
    priority_categories: ["attack_emulation_initial_access", "security_headers_tls_cors", "supply_chain_sast_sca_container_iac"],
    evidence_focus: ["exposed route inventory", "mail authentication policy", "dependency review evidence"],
    blocked_actions: ["exploit payloads", "phishing delivery", "third-party targeting"]
  },
  {
    id: "credential_access_defense",
    label: "Credential Access Defense",
    description: "Validate safe controls and telemetry around secret storage, token exposure, password policy, and credential-dumping detection readiness.",
    allowed_modes: ["passive", "ci", "authenticated"],
    target_focus: ["frontend", "backend_api", "ci_cd"],
    tactics: ["TA0006 Credential Access"],
    techniques: ["T1003 OS Credential Dumping", "T1110 Brute Force", "T1555 Credentials from Password Stores", "T1552 Unsecured Credentials"],
    priority_categories: ["attack_emulation_credential_access", "session_cookie_token", "ci_cd_secret_release"],
    evidence_focus: ["secret redaction", "token storage", "password policy metadata", "credential alert telemetry"],
    blocked_actions: ["password guessing", "credential dumping", "token theft", "credential stuffing"]
  },
  {
    id: "execution_lolbin_detection",
    label: "Execution and LOLBin Detection",
    description: "Review logging and detection readiness for script interpreters, scheduled execution, and living-off-the-land behavior.",
    allowed_modes: ["ci", "authenticated"],
    target_focus: ["ci_cd", "backend_api"],
    tactics: ["TA0002 Execution"],
    techniques: ["T1059 Command and Scripting Interpreter", "T1047 Windows Management Instrumentation", "T1053 Scheduled Task/Job"],
    priority_categories: ["attack_emulation_execution_lolbin", "logging_monitoring_error_handling", "ci_cd_secret_release"],
    evidence_focus: ["process logging coverage", "script execution policy", "CI command audit", "scheduled job inventory"],
    blocked_actions: ["command execution on targets", "malware macros", "remote shell activity"]
  },
  {
    id: "persistence_hunting_readiness",
    label: "Persistence Hunting Readiness",
    description: "Safe assessment of audit trails and configuration evidence for account manipulation, scheduled jobs, startup paths, and web shell indicators.",
    allowed_modes: ["ci", "authenticated", "db_audit"],
    target_focus: ["backend_api", "database", "ci_cd"],
    tactics: ["TA0003 Persistence"],
    techniques: ["T1098 Account Manipulation", "T1053 Scheduled Task/Job", "T1547 Boot or Logon Autostart Execution", "T1505.003 Web Shell"],
    priority_categories: ["attack_emulation_persistence_hunting", "database_readonly_audit", "logging_monitoring_error_handling"],
    evidence_focus: ["account change logs", "job inventory", "startup configuration", "web root integrity evidence"],
    blocked_actions: ["creating persistence", "web shell upload", "account takeover"]
  },
  {
    id: "privilege_escalation_controls",
    label: "Privilege Escalation Controls",
    description: "Review least-privilege, privileged route boundaries, Kubernetes/container posture, and elevation audit evidence.",
    allowed_modes: ["ci", "authenticated", "db_audit"],
    target_focus: ["backend_api", "database", "iac", "ci_cd"],
    tactics: ["TA0004 Privilege Escalation"],
    techniques: ["T1068 Exploitation for Privilege Escalation", "T1548 Abuse Elevation Control Mechanism", "T1484 Domain Policy Modification"],
    priority_categories: ["attack_emulation_privilege_escalation", "backend_api_authorization", "cloud_kubernetes_config_audit"],
    evidence_focus: ["role matrix", "privileged route inventory", "container security context", "elevation audit logs"],
    blocked_actions: ["privilege escalation attempts", "policy tampering", "container escape"]
  },
  {
    id: "defense_evasion_telemetry",
    label: "Defense Evasion Telemetry",
    description: "Assess detection coverage for logging gaps, tamper signals, obfuscation indicators, and unusual process or file metadata.",
    allowed_modes: ["ci", "authenticated"],
    target_focus: ["backend_api", "ci_cd"],
    tactics: ["TA0005 Defense Evasion", "TA0112 Defense Impairment"],
    techniques: ["T1027 Obfuscated Files or Information", "T1070 Indicator Removal", "T1036 Masquerading"],
    priority_categories: ["attack_emulation_defense_evasion", "logging_monitoring_error_handling", "ci_cd_secret_release"],
    evidence_focus: ["log retention policy", "tamper alerts", "artifact integrity", "suspicious metadata review"],
    blocked_actions: ["log deletion", "tampering", "obfuscation payloads"]
  },
  {
    id: "lateral_movement_readiness",
    label: "Lateral Movement Readiness",
    description: "Review segmentation, service-account boundaries, admin surface exposure, and telemetry for lateral movement patterns.",
    allowed_modes: ["ci", "authenticated"],
    target_focus: ["backend_api", "ci_cd", "iac"],
    tactics: ["TA0008 Lateral Movement"],
    techniques: ["T1021 Remote Services", "T1550 Use Alternate Authentication Material", "T1570 Lateral Tool Transfer"],
    priority_categories: ["attack_emulation_lateral_movement", "backend_api_authorization", "cloud_kubernetes_config_audit"],
    evidence_focus: ["network policy", "service-account scope", "admin route inventory", "remote access logs"],
    blocked_actions: ["remote service login attempts", "tool transfer", "credential reuse"]
  },
  {
    id: "collection_exfiltration_monitoring",
    label: "Collection and Exfiltration Monitoring",
    description: "Validate redaction, data minimization, export controls, DNS/object-storage telemetry, and large-transfer alert readiness.",
    allowed_modes: ["passive", "ci", "db_audit"],
    target_focus: ["frontend", "backend_api", "database", "ci_cd"],
    tactics: ["TA0009 Collection", "TA0010 Exfiltration"],
    techniques: ["T1005 Data from Local System", "T1041 Exfiltration Over C2 Channel", "T1048 Exfiltration Over Alternative Protocol", "T1567 Exfiltration Over Web Service"],
    priority_categories: ["attack_emulation_collection_exfiltration", "privacy_data_minimization", "database_readonly_audit"],
    evidence_focus: ["export route inventory", "redacted sample responses", "DLP/logging policy", "object storage access patterns"],
    blocked_actions: ["data extraction", "bulk export", "DNS tunneling", "object storage download"]
  },
  {
    id: "command_control_detection",
    label: "Command and Control Detection",
    description: "Review egress controls, suspicious beacon telemetry, DNS/HTTP log readiness, and proxy policy without generating traffic.",
    allowed_modes: ["ci", "passive"],
    target_focus: ["ci_cd", "frontend", "backend_api"],
    tactics: ["TA0011 Command and Control"],
    techniques: ["T1071 Application Layer Protocol", "T1090 Proxy", "T1105 Ingress Tool Transfer"],
    priority_categories: ["attack_emulation_command_control", "security_headers_tls_cors", "logging_monitoring_error_handling"],
    evidence_focus: ["egress policy", "DNS logs", "proxy logs", "beacon detection coverage"],
    blocked_actions: ["beaconing", "payload staging", "C2 infrastructure"]
  },
  {
    id: "impact_ransomware_resilience",
    label: "Impact and Ransomware Resilience",
    description: "Review backup posture, destructive-action deny paths, recovery evidence, and ransomware precursor alerting.",
    allowed_modes: ["passive", "ci", "db_audit"],
    target_focus: ["backend_api", "database", "ci_cd"],
    tactics: ["TA0040 Impact"],
    techniques: ["T1486 Data Encrypted for Impact", "T1490 Inhibit System Recovery", "T1485 Data Destruction"],
    priority_categories: ["attack_emulation_impact_resilience", "database_readonly_audit", "governance_scope_policy"],
    evidence_focus: ["backup metadata", "restore test evidence", "deny path inventory", "ransomware precursor alerting"],
    blocked_actions: ["encryption simulation", "destructive writes", "recovery inhibition"]
  },
  {
    id: "fraud_abuse_monitoring",
    label: "Fraud and Abuse Monitoring",
    description: "Safe financial-abuse review for beneficiary changes, refund abuse, account warming, and monetization telemetry.",
    allowed_modes: ["passive", "authenticated", "ci"],
    target_focus: ["frontend", "backend_api", "ci_cd"],
    tactics: ["MITRE F3 Positioning", "MITRE F3 Monetization"],
    techniques: ["beneficiary setup review", "refund abuse monitoring", "account warming indicators", "transaction anomaly evidence"],
    priority_categories: ["attack_emulation_fraud_abuse", "business_logic_safe_checks", "privacy_data_minimization"],
    evidence_focus: ["transaction metadata", "beneficiary change audit", "refund workflow state", "redacted account identifiers"],
    blocked_actions: ["real transaction attempts", "beneficiary changes", "refund submission", "fund movement"],
    high_sensitivity: true
  }
];

export const ATTACK_EMULATION_CATEGORY_DISTRIBUTION = ATTACK_EMULATION_PACKS.map((pack) => ({
  category: pack.priority_categories[0],
  plannedChecks: 45,
  targetType: pack.target_focus[0],
  executionMode: pack.allowed_modes[0],
  adapter: "scope_guard_adapter",
  risk: pack.high_sensitivity ? "high" : "medium",
  standards: ["MITRE_ATTACK", "MITRE_D3FEND", "NIST_CSF_2_0"],
  examples: pack.evidence_focus.map((focus) => `${pack.id} ${focus}`)
}));

export function listAttackPacks() {
  return ATTACK_EMULATION_PACKS.map((pack) => ({
    id: pack.id,
    label: pack.label,
    description: pack.description,
    allowed_modes: pack.allowed_modes,
    target_focus: pack.target_focus,
    tactics: pack.tactics
  }));
}

export function getAttackPack(packId) {
  if (!packId) {
    return undefined;
  }
  return ATTACK_EMULATION_PACKS.find((pack) => pack.id === packId);
}

export function applyAttackPack(scope, packId) {
  const pack = getAttackPack(packId);
  if (!pack) {
    throw new Error(`Unknown attack emulation pack: ${packId}`);
  }

  const nextScope = structuredClone(scope);
  nextScope.attack_emulation = {
    id: pack.id,
    label: pack.label,
    description: pack.description,
    allowed_modes: pack.allowed_modes,
    target_focus: pack.target_focus,
    tactics: pack.tactics,
    techniques: pack.techniques,
    priority_categories: pack.priority_categories,
    evidence_focus: pack.evidence_focus,
    blocked_actions: pack.blocked_actions,
    safety_note: "Defensive validation only. No exploitation, credential access, persistence, exfiltration, or destructive behavior."
  };

  nextScope.safety.max_rps = pack.high_sensitivity ? Math.min(nextScope.safety?.max_rps ?? 2, 1) : nextScope.safety?.max_rps ?? 2;
  nextScope.safety.max_concurrency = pack.high_sensitivity
    ? Math.min(nextScope.safety?.max_concurrency ?? 3, 2)
    : nextScope.safety?.max_concurrency ?? 3;
  nextScope.safety.attack_emulation = "defensive_controls_only";
  nextScope.safety.destructive_tests = false;
  nextScope.safety.brute_force = false;
  nextScope.safety.data_exfiltration = false;
  nextScope.safety.persistence = false;

  return nextScope;
}
