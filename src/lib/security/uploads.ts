import type { GuardrailConfig } from "@/lib/guardrails/config";

export const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
]);

export type UploadCandidate = {
  name: string;
  sizeBytes: number;
  mimeType: string;
};

export type UploadValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validateUploadCandidate(
  file: UploadCandidate,
  config: GuardrailConfig,
): UploadValidationResult {
  if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.mimeType)) {
    return { ok: false, reason: "Unsupported file type" };
  }

  const maxBytes = config.sources.maxFileSizeMb * 1024 * 1024;
  if (file.sizeBytes > maxBytes) {
    return { ok: false, reason: "File exceeds size limit" };
  }

  if (file.name.includes("/") || file.name.includes("\\")) {
    return { ok: false, reason: "File name must not include path separators" };
  }

  return { ok: true };
}

