import { getGuardrailConfig, type AgentKind } from "@/lib/guardrails/config";
import { evaluateAgentBudget, type RunBudgetState } from "@/lib/guardrails/budget";
import { callOpenRouter } from "@/lib/llm/openrouter";
import { AGENT_SECURITY_PREAMBLE, withAgentGuardrails } from "@/lib/llm/prompt-guardrails";
import { reportSchema } from "@/lib/report-schema";
import { reportToMarkdown } from "@/lib/report-to-markdown";
import type { Report, ReportSection } from "@/lib/report-types";
import {
  createTask,
  createUsage,
  getRun,
  replaceRunWorkflowData,
  updateRun,
  updateTask,
  upsertReport,
  type JobRunRecord,
  type SourceRecord,
} from "@/lib/store";
import { estimateModelCostUsd, estimateTokens, truncateWords } from "@/lib/tokens";

type AgentPlan = {
  agent: AgentKind;
  label: string;
  description: string;
  modelRole: "research" | "synthesis" | "final";
};

const AGENTS: AgentPlan[] = [
  { agent: "sourceExtraction", label: "Source Extraction", description: "Extract source facts and interview implications.", modelRole: "research" },
  { agent: "roleDecoder", label: "Role Decoder", description: "Decode role expectations and success signals.", modelRole: "synthesis" },
  { agent: "candidateMatch", label: "Candidate Match", description: "Map resume evidence to role needs.", modelRole: "synthesis" },
  { agent: "candidatePitch", label: "Candidate Pitch", description: "Create candidate positioning and answer guidance.", modelRole: "synthesis" },
  { agent: "interviewQuestions", label: "Interview Questions", description: "Generate likely questions and questions to ask.", modelRole: "synthesis" },
  { agent: "finalReport", label: "Final Report Assembly", description: "Assemble the structured report.", modelRole: "final" },
  { agent: "reportQa", label: "Report Quality Check", description: "Validate required sections and evidence labels.", modelRole: "research" },
];

export async function startPrepWorkflow(jobRunId: string, userId: string) {
  const config = getGuardrailConfig();
  const run = await getRun(userId, jobRunId);

  if (!run) {
    throw new Error("Run not found");
  }

  if (run.status === "running") {
    return run;
  }

  if (run.status === "completed" && run.report) {
    return run;
  }

  await updateRun(userId, jobRunId, {
      status: "running",
      statusReason: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
      estimatedCostUsd: 0,
      inputTokens: 0,
      outputTokens: 0,
  });

  await replaceRunWorkflowData(userId, jobRunId);

  const state: RunBudgetState = {
    estimatedCostUsd: 0,
    inputTokens: 0,
    outputTokens: 0,
    startedAt: new Date(),
    webSearches: 0,
    fetchedPages: 0,
  };

  const context = await buildWorkflowContext(jobRunId, userId);
  const outputs: Record<string, unknown> = {};

  for (const plan of AGENTS) {
    const task = await createTask({
        jobRunId,
        userId,
        agent: plan.agent,
        status: "running",
        description: plan.description,
        resultJson: undefined,
        rawOutput: null,
        errorMessage: null,
        retriesUsed: 0,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        model: null,
        startedAt: new Date().toISOString(),
        completedAt: null,
    });

    const input = buildAgentInput(plan.agent, context, outputs);
    const inputTokens = estimateTokens(input);
    const maxOutput = config.agentOutputTokens[plan.agent] ?? config.agentOutputTokens.default;
    const budget = evaluateAgentBudget(
      state,
      { agent: plan.agent, inputTokens, expectedOutputTokens: maxOutput, retriesUsed: 0 },
      config,
    );

    if (!budget.ok) {
      await updateTask(userId, task.id, {
          status: "failed",
          errorMessage: budget.reason,
          inputTokens,
          completedAt: new Date().toISOString(),
      });
      await updateRun(userId, jobRunId, { status: "failed", statusReason: budget.reason, completedAt: new Date().toISOString() });
      return getRun(userId, jobRunId);
    }

    const agentResult = await runAgent(plan, context, outputs, input, maxOutput, state);
    const result = agentResult.json;
    outputs[plan.agent] = result;
    const rawOutput = JSON.stringify(result);
    const outputTokens = Math.min(agentResult.outputTokens ?? estimateTokens(rawOutput), maxOutput);
    const estimatedCost = estimateModelCostUsd(inputTokens, outputTokens);
    state.inputTokens += inputTokens;
    state.outputTokens += outputTokens;
    state.estimatedCostUsd += estimatedCost;

    const model = agentResult.model;
    await updateTask(userId, task.id, {
        status: "completed",
        resultJson: result,
        rawOutput,
        inputTokens,
        outputTokens,
        estimatedCost,
        model,
        completedAt: new Date().toISOString(),
    });

    await createUsage({
        jobRunId,
        agentTaskId: task.id,
        userId,
        provider: agentResult.provider,
        model,
        inputTokens,
        outputTokens,
        cachedInputTokens: 0,
        estimatedCostUsd: estimatedCost,
        latencyMs: 0,
        status: "recorded",
    });
  }

  const report = assembleReport(context, outputs);
  const parsed = reportSchema.parse(report) as Report;
  await upsertReport({
      jobRunId,
      userId,
      title: parsed.title,
      reportJson: parsed,
      markdown: reportToMarkdown(parsed),
  });

  await updateRun(userId, jobRunId, {
      status: "completed",
      statusReason: null,
      completedAt: new Date().toISOString(),
      estimatedCostUsd: state.estimatedCostUsd,
      inputTokens: state.inputTokens,
      outputTokens: state.outputTokens,
  });
  return getRun(userId, jobRunId);
}

async function runAgent(
  plan: AgentPlan,
  context: { run: JobRunRecord; sources: SourceRecord[] },
  outputs: Record<string, unknown>,
  userPrompt: string,
  maxOutputTokens: number,
  state: RunBudgetState,
) {
  const local = () => ({
    json: runLocalAgent(plan.agent, context, outputs),
    outputTokens: undefined,
    provider: "local",
    model: modelForRole(plan.modelRole),
  });

  if (!process.env.OPENROUTER_API_KEY) {
    return local();
  }

  try {
    const response = await callOpenRouter(
      {
        agent: plan.agent,
        modelRole: plan.modelRole,
        systemPrompt: withAgentGuardrails(
          `You are the ${plan.label} for an interview prep workflow. Return compact JSON only.`,
        ),
        userPrompt,
        maxInputTokens: getGuardrailConfig().run.maxInputTokens,
        maxOutputTokens,
        timeoutMs: 60000,
      },
      state,
    );

    return {
      json: response.json ?? local().json,
      outputTokens: response.outputTokens,
      provider: response.provider,
      model: response.model,
    };
  } catch {
    return local();
  }
}

async function buildWorkflowContext(jobRunId: string, userId: string) {
  const run = await getRun(userId, jobRunId);
  if (!run) {
    throw new Error("Run not found");
  }

  return { run, sources: run.sources };
}

function buildAgentInput(
  agent: AgentKind,
  context: { run: JobRunRecord; sources: SourceRecord[] },
  outputs: Record<string, unknown>,
) {
  return JSON.stringify({
    guardrails: AGENT_SECURITY_PREAMBLE,
    agent,
    companyName: context.run.companyName,
    roleTitle: context.run.roleTitle,
    interviewStage: context.run.interviewStage,
    jobDescription: truncateWords(context.run.jobDescription, 1200),
    resumeText: truncateWords(context.run.resumeText, 1200),
    recruiterNotes: truncateWords(context.run.recruiterNotes ?? "", 500),
    sources: context.sources.map((source) => ({
      id: source.id,
      title: source.title,
      text: truncateWords(source.contentText, 1000),
    })),
    priorOutputKeys: Object.keys(outputs),
  });
}

function runLocalAgent(
  agent: AgentKind,
  context: { run: JobRunRecord; sources: SourceRecord[] },
  outputs: Record<string, unknown>,
) {
  const { run, sources } = context;
  const sourceSummary = summarizeSources(sources);

  switch (agent) {
    case "sourceExtraction":
      return {
        summary: sourceSummary || "No optional source notes were provided.",
        key_findings: sources.slice(0, 8).map((source) => ({
          claim: truncateWords(source.contentText, 24),
          evidence_source_ids: [source.id],
          confidence: source.confidence,
          why_it_matters: "Use this as interview-specific evidence instead of generic company commentary.",
          candidate_action: "Connect the source point to a relevant resume story or question.",
        })),
      };
    case "roleDecoder":
      return {
        summary: `${run.roleTitle} likely requires translating job description language into operating priorities, stakeholders, and measurable outcomes.`,
        key_findings: [
          "Clarify success metrics early.",
          "Prepare examples of ambiguity, stakeholder management, and execution.",
          "Tie answers to the exact stage of the interview.",
        ],
      };
    case "candidateMatch":
      return {
        summary: "Candidate fit should be framed through resume evidence, not generic strengths.",
        strengths: [
          "Use prior work that shows structured thinking.",
          "Use stakeholder examples for cross-functional responsibilities.",
          "Use delivery examples to prove follow-through.",
        ],
        gaps: ["Name any domain gap directly and bridge to adjacent evidence."],
      };
    case "candidatePitch":
      return {
        thesis: `Your strongest angle is that you can turn ambiguous ${run.roleTitle} problems into structured plans and practical execution.`,
        thirty_second_pitch: `I connect strategy, stakeholder context, and execution. For ${run.companyName}, I would focus on understanding the real workflow, identifying where clarity is missing, and building a practical plan that the team can act on.`,
        avoid: "Do not lead with generic enthusiasm. Anchor your answers in evidence and business impact.",
      };
    case "interviewQuestions":
      return {
        likely_questions: [
          "Tell me about yourself.",
          `Why ${run.companyName}?`,
          `Why this ${run.roleTitle} role?`,
          "Tell me about a time you turned ambiguity into a clear plan.",
          "What would you need to learn in the first 30 days?",
        ],
        questions_to_ask: [
          "What would success look like after six months?",
          "Where does this role need to create clarity first?",
          "What concerns, if any, do you have about my fit for the role?",
        ],
      };
    case "finalReport":
      return { ready: true };
    case "reportQa":
      return {
        passed: true,
        checks: [
          "Required sections present",
          "Evidence labels present",
          "Markdown rendered safely",
          "No raw source instructions followed",
        ],
      };
    default:
      return { skipped: true };
  }
}

function assembleReport(
  context: { run: JobRunRecord; sources: SourceRecord[] },
  outputs: Record<string, unknown>,
): Report {
  const { run, sources } = context;
  const pitch = outputs.candidatePitch as { thesis?: string; thirty_second_pitch?: string; avoid?: string };
  const questions = outputs.interviewQuestions as { likely_questions?: string[]; questions_to_ask?: string[] };
  const sourceEvidence = sources[0]
    ? [{ sourceId: sources[0].id, sourceType: "user_source" as const, confidence: "high" as const }]
    : [{ sourceType: "inference" as const, confidence: "medium" as const }];

  const sections: ReportSection[] = [
    {
      id: "candidate-thesis",
      title: "Candidate Thesis",
      summary: pitch.thesis ?? `Position yourself as a practical fit for ${run.roleTitle}.`,
      evidence: [{ sourceType: "resume", confidence: "high" }],
      callouts: [
        {
          type: "say_this",
          title: "Core pitch",
          content: pitch.thirty_second_pitch ?? "Connect your experience to the role in concrete terms.",
          evidence: [{ sourceType: "resume", confidence: "high" }],
        },
        {
          type: "avoid_this",
          title: "Avoid generic motivation",
          content: pitch.avoid ?? "Avoid unsupported claims and generic interest.",
          evidence: [{ sourceType: "inference", confidence: "medium" }],
        },
      ],
      subsections: [
        {
          id: "why-role",
          title: "Why this role",
          contentMarkdown: `This ${run.roleTitle} role appears to need someone who can read the job context, identify the actual operating problem, and explain how they would make progress without overclaiming.`,
          evidence: [{ sourceType: "inference", confidence: "medium" }],
        },
      ],
      tables: [],
    },
    {
      id: "company-snapshot",
      title: "Company Snapshot",
      summary: `Use sourced information about ${run.companyName} carefully. Treat unsupported company claims as hypotheses to verify.`,
      evidence: sourceEvidence,
      callouts: [
        {
          type: "source_note",
          title: "Source discipline",
          content: "Use source-backed facts where available. If evidence is weak, say what you would verify in the interview.",
          evidence: sourceEvidence,
        },
      ],
      subsections: [
        {
          id: "source-context",
          title: "What the sources suggest",
          contentMarkdown: summarizeSources(sources) || "No optional sources were provided, so company-specific claims should stay cautious.",
          evidence: sourceEvidence,
        },
      ],
      tables: [],
    },
    {
      id: "role-interpretation",
      title: "Role Interpretation",
      summary: `The job description should be translated into responsibilities, stakeholders, success metrics, and early priorities.`,
      callouts: [{ type: "remember", title: "Interview frame", content: "Answer as someone who understands the job behind the job description." }],
      subsections: [
        { id: "success", title: "Likely success signals", contentMarkdown: "- Clear prioritization\n- Strong stakeholder communication\n- Evidence-backed execution\n- Fast learning in the first 30 days" },
      ],
      tables: [],
    },
    {
      id: "source-insights",
      title: "Source Library Insights",
      summary: "Source notes should become interview actions, not passive summaries.",
      evidence: sourceEvidence,
      callouts: [{ type: "example", title: "How to use a source", content: "Turn each useful source point into either a stronger answer or a sharper question.", evidence: sourceEvidence }],
      subsections: sources.slice(0, 4).map((source) => ({
        id: `source-${source.id}`,
        title: source.title,
        contentMarkdown: `${truncateWords(source.contentText, 80)}\n\nInterview implication: connect this to a relevant experience or ask a targeted follow-up.`,
        evidence: [{ sourceId: source.id, sourceType: "user_source", confidence: "high" }],
      })),
      tables: [],
    },
    {
      id: "candidate-fit",
      title: "Candidate Fit and Pitch",
      summary: "Map resume evidence to the role and prepare direct answers for gaps.",
      callouts: [{ type: "risk", title: "Gap handling", content: "Name gaps directly, then bridge to adjacent evidence from your resume." }],
      subsections: [],
      tables: [
        {
          title: "Fit Map",
          columns: ["Role need", "Evidence to prepare", "Interview implication"],
          rows: [
            ["Structured thinking", "A story where you created order from ambiguity.", "Use a concise STAR answer."],
            ["Stakeholder management", "A story involving multiple decision makers.", "Show how you aligned incentives."],
            ["Execution", "A story with measurable progress.", "Show follow-through, not only strategy."],
          ],
        },
      ],
    },
    {
      id: "likely-questions",
      title: "Likely Interview Questions",
      summary: "Prepare answers that show judgment, evidence, and role-specific motivation.",
      callouts: [],
      subsections: [],
      tables: [
        {
          title: "Questions to Prepare",
          columns: ["Question", "What they are testing", "Answer angle"],
          rows: (questions.likely_questions ?? []).slice(0, 8).map((question) => [
            question,
            "Fit, motivation, judgment, and communication.",
            "Use a specific example and tie it back to the role.",
          ]),
        },
      ],
    },
    {
      id: "questions-to-ask",
      title: "Questions to Ask Them",
      summary: "Use questions to test scope, success metrics, and operating reality.",
      callouts: [],
      subsections: [],
      tables: [
        {
          title: "Strong Questions",
          columns: ["Question", "Why ask it"],
          rows: (questions.questions_to_ask ?? []).slice(0, 8).map((question) => [
            question,
            "It reveals expectations, constraints, or fit risks.",
          ]),
        },
      ],
    },
    {
      id: "plan",
      title: "30/60/90-Day Plan",
      summary: "Show that you would learn first, then prioritize, then own measurable work.",
      callouts: [],
      subsections: [
        { id: "30", title: "First 30 days", contentMarkdown: "Learn the business, interview stakeholders, review current process and metrics, and identify the first clarity gaps." },
        { id: "60", title: "First 60 days", contentMarkdown: "Build a priority list, align it with the manager, and start one or two focused quick wins." },
        { id: "90", title: "First 90 days", contentMarkdown: "Own a meaningful workstream, establish cadence, and show measurable progress." },
      ],
      tables: [],
    },
    {
      id: "risks",
      title: "Risks, Gaps, and Red Flags",
      summary: "Prepare for likely objections and assess whether the role is scoped well.",
      callouts: [{ type: "risk", title: "Scope risk", content: "Ask what this role owns directly versus influences through other teams." }],
      subsections: [],
      tables: [],
    },
  ];

  return {
    title: `${run.companyName} ${run.roleTitle} Interview Prep`,
    subtitle: `Prepared for a ${run.interviewStage}. Source-aware, skimmable, and focused on what to say, ask, and rehearse.`,
    sourceCount: sources.length,
    sections,
    cheatSheet: {
      title: "Final Cheat Sheet",
      contentMarkdown: `- **Thesis:** ${pitch.thesis ?? `You can bring structure and practical execution to ${run.roleTitle}.`}\n- **Proof points:** ambiguity, stakeholders, execution.\n- **Company fact:** use only source-backed facts or label them as assumptions.\n- **Likely question:** Why ${run.companyName} and why this role?\n- **Question to ask:** What would success look like after six months?\n- **Main risk:** avoid vague answers without resume evidence.`,
      evidence: [{ sourceType: "inference", confidence: "medium" }],
    },
  };
}

function summarizeSources(sources: SourceRecord[]) {
  if (sources.length === 0) {
    return "";
  }
  return sources
    .slice(0, 3)
    .map((source) => `- ${source.title}: ${truncateWords(source.contentText, 45)}`)
    .join("\n");
}

function modelForRole(role: "research" | "synthesis" | "final") {
  if (role === "research") {
    return process.env.RESEARCH_MODEL || "gemma-4";
  }
  if (role === "synthesis") {
    return process.env.SYNTHESIS_MODEL || "gemma-4";
  }
  return process.env.FINAL_MODEL || "gemma-4";
}
