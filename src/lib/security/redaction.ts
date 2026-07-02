const REDACTION_PATTERNS: RegExp[] = [
  /\bsk-[A-Za-z0-9_-]{12,}\b/g,
  /\b(api[_-]?key|OPENAI_API_KEY|OPENROUTER_API_KEY|DATABASE_URL)\b\s*[:=]\s*["']?[^"'\s]+/gi,
  /\bBearer\s+[A-Za-z0-9._-]{12,}\b/g,
];

export function redactSecrets(value: string) {
  return REDACTION_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, "[REDACTED]"),
    value,
  );
}

export function redactUnknownError(error: unknown) {
  if (error instanceof Error) {
    return redactSecrets(error.message);
  }

  if (typeof error === "string") {
    return redactSecrets(error);
  }

  return "Unexpected error";
}

