const REDACTION_PATTERNS: Array<[RegExp, string]> = [
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]"],
  [/\+?\d[\d\s().-]{8,}\d/g, "[REDACTED_PHONE]"],
  [/\b\d{3}-?\d{2}-?\d{4}\b/g, "[REDACTED_SSN]"],
  [
    /(authorization|token|secret|api[_-]?key|password)=([^&\s]+)/gi,
    "$1=[REDACTED]",
  ],
  [/(Bearer\s+)[A-Za-z0-9._~+/-]+=*/g, "$1[REDACTED]"],
];

export function redactSensitiveText(value: unknown): string {
  let output = typeof value === "string" ? value : JSON.stringify(value);

  if (!output) {
    output = String(value);
  }

  for (const [pattern, replacement] of REDACTION_PATTERNS) {
    output = output.replace(pattern, replacement);
  }

  return output;
}

export function summarizeSafeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: redactSensitiveText(error.message),
    };
  }

  return { message: redactSensitiveText(error) };
}
