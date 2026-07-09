# Security Policy

Aegis Security CLI is for authorized testing only.

## Supported Version

The `main` branch is the active development line.

## Reporting

Do not open public issues containing secrets, private target data, exploit
payloads, or sensitive reports. Use a private maintainer contact channel or
GitHub private vulnerability reporting when enabled.

## Safety Expectations

- Scope verification must run before target access.
- Destructive, brute-force, exfiltration, persistence, and evasion behavior must
  remain disabled by default.
- Reports must redact sensitive values before display or AI handoff.
