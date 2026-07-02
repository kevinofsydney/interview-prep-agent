import { z } from "zod";

const envNumber = (fallback: number) =>
  z.coerce.number().finite().positive().catch(fallback);

const guardrailEnvSchema = z.object({
  MAX_RUN_COST_USD: envNumber(1),
  MAX_DAILY_COST_USD: envNumber(5),
  MAX_INPUT_TOKENS_PER_RUN: envNumber(60000),
  MAX_OUTPUT_TOKENS_PER_RUN: envNumber(12000),
  MAX_OUTPUT_TOKENS_PER_AGENT: envNumber(2500),
  MAX_AGENT_RETRIES: z.coerce.number().int().min(0).catch(1),
  MAX_RUN_DURATION_SECONDS: envNumber(300),
  MAX_SOURCES_PER_RUN: z.coerce.number().int().positive().catch(8),
  MAX_URLS_PER_RUN: z.coerce.number().int().positive().catch(8),
  MAX_FILES_PER_RUN: z.coerce.number().int().positive().catch(5),
  MAX_FILE_SIZE_MB: envNumber(8),
  MAX_EXTRACTED_TEXT_TOKENS_PER_SOURCE: envNumber(20000),
  MAX_SOURCE_CHUNKS_PER_RUN: z.coerce.number().int().positive().catch(80),
  MAX_CHUNKS_PER_AGENT: z.coerce.number().int().positive().catch(20),
  MAX_WEB_SEARCHES_PER_RUN: z.coerce.number().int().positive().catch(10),
  MAX_FETCHED_PAGES_PER_RUN: z.coerce.number().int().positive().catch(20),
  MAX_FETCH_RESPONSE_BYTES: z.coerce.number().int().positive().catch(2000000),
  SOURCE_EXTRACTION_MAX_OUTPUT_TOKENS: envNumber(1800),
  COMPANY_RESEARCH_MAX_OUTPUT_TOKENS: envNumber(1800),
  COMPETITIVE_POSITION_MAX_OUTPUT_TOKENS: envNumber(1800),
  ROLE_DECODER_MAX_OUTPUT_TOKENS: envNumber(1400),
  TERMINOLOGY_MAX_OUTPUT_TOKENS: envNumber(1200),
  CANDIDATE_MATCH_MAX_OUTPUT_TOKENS: envNumber(1800),
  CANDIDATE_PITCH_MAX_OUTPUT_TOKENS: envNumber(1600),
  INTERVIEW_QUESTIONS_MAX_OUTPUT_TOKENS: envNumber(2200),
  IMAGE_SELECTION_MAX_OUTPUT_TOKENS: envNumber(800),
  FINAL_REPORT_MAX_OUTPUT_TOKENS: envNumber(4500),
  CHEAT_SHEET_MAX_OUTPUT_TOKENS: envNumber(1000),
  REPORT_QA_MAX_OUTPUT_TOKENS: envNumber(900),
});

export type AgentKind =
  | "sourceExtraction"
  | "companyResearch"
  | "competitivePosition"
  | "roleDecoder"
  | "terminology"
  | "candidateMatch"
  | "candidatePitch"
  | "interviewQuestions"
  | "imageSelection"
  | "finalReport"
  | "cheatSheet"
  | "reportQa";

export type GuardrailConfig = ReturnType<typeof getGuardrailConfig>;

export function getGuardrailConfig() {
  const env = guardrailEnvSchema.parse(process.env);

  return {
    run: {
      maxCostUsd: env.MAX_RUN_COST_USD,
      maxDailyCostUsd: env.MAX_DAILY_COST_USD,
      maxInputTokens: env.MAX_INPUT_TOKENS_PER_RUN,
      maxOutputTokens: env.MAX_OUTPUT_TOKENS_PER_RUN,
      maxDurationSeconds: env.MAX_RUN_DURATION_SECONDS,
      maxAgentRetries: env.MAX_AGENT_RETRIES,
    },
    sources: {
      maxSourcesPerRun: env.MAX_SOURCES_PER_RUN,
      maxUrlsPerRun: env.MAX_URLS_PER_RUN,
      maxFilesPerRun: env.MAX_FILES_PER_RUN,
      maxFileSizeMb: env.MAX_FILE_SIZE_MB,
      maxExtractedTextTokensPerSource: env.MAX_EXTRACTED_TEXT_TOKENS_PER_SOURCE,
      maxSourceChunksPerRun: env.MAX_SOURCE_CHUNKS_PER_RUN,
      maxChunksPerAgent: env.MAX_CHUNKS_PER_AGENT,
      maxWebSearchesPerRun: env.MAX_WEB_SEARCHES_PER_RUN,
      maxFetchedPagesPerRun: env.MAX_FETCHED_PAGES_PER_RUN,
      maxFetchResponseBytes: env.MAX_FETCH_RESPONSE_BYTES,
    },
    agentOutputTokens: {
      sourceExtraction: env.SOURCE_EXTRACTION_MAX_OUTPUT_TOKENS,
      companyResearch: env.COMPANY_RESEARCH_MAX_OUTPUT_TOKENS,
      competitivePosition: env.COMPETITIVE_POSITION_MAX_OUTPUT_TOKENS,
      roleDecoder: env.ROLE_DECODER_MAX_OUTPUT_TOKENS,
      terminology: env.TERMINOLOGY_MAX_OUTPUT_TOKENS,
      candidateMatch: env.CANDIDATE_MATCH_MAX_OUTPUT_TOKENS,
      candidatePitch: env.CANDIDATE_PITCH_MAX_OUTPUT_TOKENS,
      interviewQuestions: env.INTERVIEW_QUESTIONS_MAX_OUTPUT_TOKENS,
      imageSelection: env.IMAGE_SELECTION_MAX_OUTPUT_TOKENS,
      finalReport: env.FINAL_REPORT_MAX_OUTPUT_TOKENS,
      cheatSheet: env.CHEAT_SHEET_MAX_OUTPUT_TOKENS,
      reportQa: env.REPORT_QA_MAX_OUTPUT_TOKENS,
      default: env.MAX_OUTPUT_TOKENS_PER_AGENT,
    } satisfies Record<AgentKind | "default", number>,
  };
}

export function getAgentMaxOutputTokens(agent: AgentKind) {
  const config = getGuardrailConfig();
  return config.agentOutputTokens[agent] ?? config.agentOutputTokens.default;
}

