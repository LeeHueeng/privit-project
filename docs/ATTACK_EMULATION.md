# Safe Attack Emulation

Aegis uses attack emulation as a defensive planning layer, not an offensive
execution engine.

The structure is inspired by the public
[`mukul975/Anthropic-Cybersecurity-Skills`](https://github.com/mukul975/Anthropic-Cybersecurity-Skills)
repository, which organizes cybersecurity skills across MITRE ATT&CK, NIST CSF,
MITRE ATLAS, D3FEND, AI RMF, and MITRE F3 mappings. Aegis only imports the
taxonomy idea: tactics, evidence focus, and defensive coverage. It does not
import exploit workflows, payloads, credential access steps, persistence steps,
C2 setup, or exfiltration instructions.

## Commands

```bash
aegis attacks list
aegis attacks show credential_access_defense
aegis init --attack-pack initial_access_hardening
aegis plan --mode passive --target frontend --attack-pack recon_exposure_review
```

## Safety Boundary

- Authorization and scope verification still run before planning or execution.
- Hosts and paths still must match allowlists.
- Reports and AI-bound data are still redacted.
- Exploit payloads, phishing delivery, password guessing, credential dumping,
  persistence creation, C2 traffic, data extraction, and destructive writes are
  blocked by design.

## Packs

| Pack | Defensive goal |
| --- | --- |
| `recon_exposure_review` | Review public discovery, metadata, sitemap, robots, API docs, and accidental admin surface exposure. |
| `initial_access_hardening` | Review exposed app posture, phishing readiness evidence, external service policy, and supply-chain entry points. |
| `credential_access_defense` | Validate safe controls and telemetry around secret storage, token exposure, password policy, and credential-dumping detection readiness. |
| `execution_lolbin_detection` | Review logging and detection readiness for script interpreters, scheduled execution, and living-off-the-land behavior. |
| `persistence_hunting_readiness` | Assess audit trails and configuration evidence for account manipulation, scheduled jobs, startup paths, and web shell indicators. |
| `privilege_escalation_controls` | Review least privilege, privileged route boundaries, Kubernetes/container posture, and elevation audit evidence. |
| `defense_evasion_telemetry` | Assess logging gaps, tamper signals, obfuscation indicators, and unusual process or file metadata. |
| `lateral_movement_readiness` | Review segmentation, service-account boundaries, admin surface exposure, and lateral movement telemetry. |
| `collection_exfiltration_monitoring` | Validate redaction, data minimization, export controls, DNS/object-storage telemetry, and large-transfer alert readiness. |
| `command_control_detection` | Review egress controls, suspicious beacon telemetry, DNS/HTTP log readiness, and proxy policy without generating traffic. |
| `impact_ransomware_resilience` | Review backup posture, destructive-action deny paths, recovery evidence, and ransomware precursor alerting. |
| `fraud_abuse_monitoring` | Review beneficiary changes, refund abuse, account warming, and monetization telemetry without real transactions. |

## References

- Anthropic Cybersecurity Skills: <https://github.com/mukul975/Anthropic-Cybersecurity-Skills>
- MITRE ATT&CK: <https://attack.mitre.org/>
- MITRE D3FEND: <https://d3fend.mitre.org/>
- NIST Cybersecurity Framework 2.0: <https://www.nist.gov/cyberframework>
