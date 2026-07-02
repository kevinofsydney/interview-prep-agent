import { describe, expect, it } from "vitest";
import { createRun, deleteRun, getLocalUser, getRun } from "../src/lib/store";
import { estimateTokens } from "../src/lib/tokens";
import { startPrepWorkflow } from "../src/lib/workflow";

async function createTestRun() {
  const user = await getLocalUser();
  const source = "The hiring team wants structured thinking, stakeholder management, and pragmatic AI workflow design.";
  const run = await createRun({
    userId: user.id,
    companyName: "Sierra",
    roleTitle: "Agent Strategist",
    jobDescription:
      "This role requires strategy, stakeholder management, customer discovery, and AI workflow design experience.",
    resumeText:
      "Candidate has experience in strategy, operations, stakeholder management, and AI-assisted workflow design.",
    interviewStage: "Hiring manager interview",
    recruiterNotes: "Focus on customer strategy and execution.",
    inputTokens: 100,
    source: {
      title: "Recruiter note",
      contentText: source,
      tokenCount: estimateTokens(source),
    },
  });
  return { user, run };
}

describe("run workflow", () => {
  it("creates a run record", async () => {
    const { user, run } = await createTestRun();
    const loaded = await getRun(user.id, run.id);

    expect(loaded?.companyName).toBe("Sierra");
    expect(loaded?.sources).toHaveLength(1);

    await deleteRun(user.id, run.id);
  });

  it("completes the workflow with report and usage records", async () => {
    const { user, run } = await createTestRun();

    await startPrepWorkflow(run.id, user.id);
    const loaded = await getRun(user.id, run.id);

    expect(loaded?.status).toBe("completed");
    expect(loaded?.tasks).toHaveLength(7);
    expect(loaded?.report).toBeTruthy();
    expect(loaded?.modelUsage).toHaveLength(7);

    await deleteRun(user.id, run.id);
  });

  it("fails gracefully when the token budget is too low", async () => {
    const previous = process.env.MAX_INPUT_TOKENS_PER_RUN;
    process.env.MAX_INPUT_TOKENS_PER_RUN = "10";
    const { user, run } = await createTestRun();

    await startPrepWorkflow(run.id, user.id);
    const loaded = await getRun(user.id, run.id);

    expect(loaded?.status).toBe("failed");
    expect(loaded?.statusReason).toContain("token");

    await deleteRun(user.id, run.id);
    if (previous === undefined) {
      delete process.env.MAX_INPUT_TOKENS_PER_RUN;
    } else {
      process.env.MAX_INPUT_TOKENS_PER_RUN = previous;
    }
  });
});

