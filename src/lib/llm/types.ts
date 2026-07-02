import type { AgentKind } from "@/lib/guardrails/config";

export type ModelRole = "research" | "synthesis" | "final";

export type LlmRequest = {
  agent: AgentKind;
  modelRole: ModelRole;
  systemPrompt: string;
  userPrompt: string;
  responseSchema?: object;
  maxInputTokens: number;
  maxOutputTokens: number;
  timeoutMs: number;
};

export type LlmResponse = {
  text: string;
  json?: unknown;
  inputTokens?: number;
  outputTokens?: number;
  provider: string;
  model: string;
  finishReason?: string;
};

export type ModelUsageRecord = {
  id: string;
  jobRunId: string;
  agentTaskId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  estimatedCostUsd: number;
  latencyMs: number;
  createdAt: string;
};

