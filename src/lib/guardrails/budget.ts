import type { AgentKind, GuardrailConfig } from "@/lib/guardrails/config";

export type RunBudgetState = {
  estimatedCostUsd: number;
  inputTokens: number;
  outputTokens: number;
  startedAt: Date;
  webSearches: number;
  fetchedPages: number;
};

export type AgentBudgetRequest = {
  agent: AgentKind;
  inputTokens: number;
  expectedOutputTokens?: number;
  retriesUsed: number;
};

export type BudgetDecision =
  | { ok: true; maxOutputTokens: number }
  | { ok: false; reason: string };

export function evaluateRunBudget(
  run: RunBudgetState,
  config: GuardrailConfig,
  now = new Date(),
): BudgetDecision {
  if (run.estimatedCostUsd >= config.run.maxCostUsd) {
    return { ok: false, reason: "Run budget exceeded" };
  }

  if (run.inputTokens >= config.run.maxInputTokens) {
    return { ok: false, reason: "Input token budget exceeded" };
  }

  if (run.outputTokens >= config.run.maxOutputTokens) {
    return { ok: false, reason: "Output token budget exceeded" };
  }

  const elapsedSeconds = Math.floor(
    (now.getTime() - run.startedAt.getTime()) / 1000,
  );
  if (elapsedSeconds >= config.run.maxDurationSeconds) {
    return { ok: false, reason: "Run duration exceeded" };
  }

  if (run.webSearches >= config.sources.maxWebSearchesPerRun) {
    return { ok: false, reason: "Web search budget exceeded" };
  }

  if (run.fetchedPages >= config.sources.maxFetchedPagesPerRun) {
    return { ok: false, reason: "Fetched page budget exceeded" };
  }

  return { ok: true, maxOutputTokens: config.agentOutputTokens.default };
}

export function evaluateAgentBudget(
  run: RunBudgetState,
  request: AgentBudgetRequest,
  config: GuardrailConfig,
): BudgetDecision {
  const runDecision = evaluateRunBudget(run, config);
  if (!runDecision.ok) {
    return runDecision;
  }

  if (request.retriesUsed > config.run.maxAgentRetries) {
    return { ok: false, reason: "Agent retry budget exceeded" };
  }

  const agentMaxOutput =
    config.agentOutputTokens[request.agent] ?? config.agentOutputTokens.default;
  const remainingOutput = config.run.maxOutputTokens - run.outputTokens;
  const requestedOutput = request.expectedOutputTokens ?? agentMaxOutput;

  if (request.inputTokens + run.inputTokens > config.run.maxInputTokens) {
    return { ok: false, reason: "Agent input would exceed run token budget" };
  }

  if (requestedOutput > agentMaxOutput) {
    return { ok: false, reason: "Agent requested output exceeds configured cap" };
  }

  if (requestedOutput > remainingOutput) {
    return { ok: false, reason: "Agent output would exceed run token budget" };
  }

  return { ok: true, maxOutputTokens: agentMaxOutput };
}

