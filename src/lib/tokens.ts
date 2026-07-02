export function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.trim().length / 4));
}

export function estimateModelCostUsd(inputTokens: number, outputTokens: number) {
  const inputPer1k = Number(process.env.MODEL_INPUT_COST_PER_1K_USD ?? "0.0001");
  const outputPer1k = Number(process.env.MODEL_OUTPUT_COST_PER_1K_USD ?? "0.0002");
  return (inputTokens / 1000) * inputPer1k + (outputTokens / 1000) * outputPer1k;
}

export function truncateWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return text.trim();
  }
  return `${words.slice(0, maxWords).join(" ")}...`;
}

