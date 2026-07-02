import type { GuardrailConfig } from "@/lib/guardrails/config";

export type SourceRunCounts = {
  sources: number;
  urls: number;
  files: number;
  chunks: number;
};

export type SourceLimitDecision =
  | { ok: true }
  | { ok: false; reason: string };

export function evaluateSourceRunLimits(
  counts: SourceRunCounts,
  config: GuardrailConfig,
): SourceLimitDecision {
  if (counts.sources > config.sources.maxSourcesPerRun) {
    return { ok: false, reason: "Source count limit exceeded" };
  }

  if (counts.urls > config.sources.maxUrlsPerRun) {
    return { ok: false, reason: "URL count limit exceeded" };
  }

  if (counts.files > config.sources.maxFilesPerRun) {
    return { ok: false, reason: "File count limit exceeded" };
  }

  if (counts.chunks > config.sources.maxSourceChunksPerRun) {
    return { ok: false, reason: "Source chunk limit exceeded" };
  }

  return { ok: true };
}

