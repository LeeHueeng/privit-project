import { SENSITIVE_FIELDS } from "./config.js";

const TOKEN_PATTERN = /\b([A-Za-z0-9_-]*?(token|secret|password|apikey|api_key|private_key)[A-Za-z0-9_-]*?)=([^&\s]+)/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

function isSensitiveKey(key) {
  const normalized = String(key).toLowerCase();
  return SENSITIVE_FIELDS.some((field) => normalized.includes(field));
}

export function redactValue(value) {
  if (typeof value !== "string") {
    return value;
  }
  return value
    .replace(TOKEN_PATTERN, "$1=[REDACTED]")
    .replace(EMAIL_PATTERN, "[REDACTED_EMAIL]");
}

export function redact(input) {
  if (Array.isArray(input)) {
    return input.map((item) => redact(item));
  }
  if (input && typeof input === "object") {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => {
        if (isSensitiveKey(key)) {
          return [key, "[REDACTED]"];
        }
        return [key, redact(value)];
      })
    );
  }
  return redactValue(input);
}

