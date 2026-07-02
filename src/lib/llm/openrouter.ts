import { evaluateAgentBudget, type RunBudgetState } from "@/lib/guardrails/budget";
import { getGuardrailConfig } from "@/lib/guardrails/config";
import { parseJsonResponse } from "@/lib/llm/json";
import type { LlmRequest, LlmResponse } from "@/lib/llm/types";
import { estimateTokens } from "@/lib/tokens";

type OpenRouterChoice = {
  message?: { content?: string };
  finish_reason?: string;
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
};

export async function callOpenRouter(
  request: LlmRequest,
  runState: RunBudgetState,
): Promise<LlmResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const config = getGuardrailConfig();
  const inputTokens = estimateTokens(`${request.systemPrompt}\n${request.userPrompt}`);
  const budget = evaluateAgentBudget(
    runState,
    {
      agent: request.agent,
      inputTokens,
      expectedOutputTokens: request.maxOutputTokens,
      retriesUsed: 0,
    },
    config,
  );

  if (!budget.ok) {
    throw new Error(budget.reason);
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Interview Prep Agent",
    },
    body: JSON.stringify({
      model: modelForRole(request.modelRole),
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt },
      ],
      max_tokens: request.maxOutputTokens,
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(request.timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed: ${response.status}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const text = data.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonResponse(text);

  return {
    text,
    json: parsed.ok ? parsed.json : undefined,
    inputTokens: data.usage?.prompt_tokens ?? inputTokens,
    outputTokens: data.usage?.completion_tokens ?? estimateTokens(text),
    provider: "openrouter",
    model: modelForRole(request.modelRole),
    finishReason: data.choices?.[0]?.finish_reason,
  };
}

function modelForRole(role: LlmRequest["modelRole"]) {
  if (role === "research") {
    return process.env.RESEARCH_MODEL || "gemma-4";
  }
  if (role === "synthesis") {
    return process.env.SYNTHESIS_MODEL || "gemma-4";
  }
  return process.env.FINAL_MODEL || "gemma-4";
}
