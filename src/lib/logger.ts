import { redactUnknownError, redactSecrets } from "@/lib/security/redaction";

type LogContext = Record<string, string | number | boolean | null | undefined>;

function sanitizeContext(context?: LogContext) {
  if (!context) return undefined;
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      typeof value === "string" ? redactSecrets(value) : value,
    ]),
  );
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.info(JSON.stringify({ level: "info", message, context: sanitizeContext(context) }));
  },
  warn(message: string, context?: LogContext) {
    console.warn(JSON.stringify({ level: "warn", message, context: sanitizeContext(context) }));
  },
  error(message: string, error: unknown, context?: LogContext) {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        error: redactUnknownError(error),
        context: sanitizeContext(context),
      }),
    );
  },
};

