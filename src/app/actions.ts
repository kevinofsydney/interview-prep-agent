"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAuthCookies, getAccessPassword, requireAuth, setAuthCookies } from "@/lib/auth";
import { redirectToError } from "@/lib/errors";
import { getGuardrailConfig } from "@/lib/guardrails/config";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRun, deleteRun, getLocalUser } from "@/lib/store";
import { formDataToNewRunInput, newRunSchema } from "@/lib/validation/run";
import { evaluateSourceRunLimits } from "@/lib/sources/source-limits";
import { estimateTokens } from "@/lib/tokens";
import { startPrepWorkflow } from "@/lib/workflow";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (password !== getAccessPassword()) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await setAuthCookies();
  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  await clearAuthCookies();
  redirect("/login");
}

export async function createRunAction(formData: FormData) {
  await requireAuth();
  const user = await getLocalUser();
  const config = getGuardrailConfig();
  const rate = checkRateLimit({
    key: `${user.id}:create-run`,
    limit: config.sources.runCreateRateLimit,
  });
  if (!rate.ok) {
    redirectToError("rate_limit");
  }

  const parsed = newRunSchema.safeParse(formDataToNewRunInput(formData));
  if (!parsed.success) {
    redirectToError("validation", parsed.error.issues[0]?.message);
  }

  const input = parsed.data;
  const sourceText = input.sourceText?.trim() ?? "";
  const sourceCount = sourceText ? 1 : 0;
  const sourceTokens = sourceText ? estimateTokens(sourceText) : 0;

  const sourceLimit = evaluateSourceRunLimits(
    { sources: sourceCount, urls: 0, files: 0, chunks: sourceCount },
    config,
  );
  if (!sourceLimit.ok) {
    redirectToError("budget", sourceLimit.reason);
  }
  if (sourceTokens > config.sources.maxExtractedTextTokensPerSource) {
    redirectToError("budget", "Source text exceeds per-source token limit");
  }

  const totalInputTokens =
    estimateTokens(input.jobDescription) +
    estimateTokens(input.resumeText) +
    estimateTokens(input.recruiterNotes ?? "") +
    sourceTokens;

  if (totalInputTokens > config.run.maxInputTokens) {
    redirectToError("budget", "Run input token budget exceeded");
  }

  let runId = "";
  try {
    const run = await createRun({
      userId: user.id,
      companyName: input.companyName,
      roleTitle: input.roleTitle,
      jobDescription: input.jobDescription,
      resumeText: input.resumeText,
      interviewStage: input.interviewStage,
      recruiterNotes: input.recruiterNotes || null,
      inputTokens: totalInputTokens,
      source: sourceText
        ? {
            title: input.sourceTitle || "Pasted source notes",
            contentText: sourceText,
            tokenCount: sourceTokens,
          }
        : undefined,
    });

    runId = run.id;
    await startPrepWorkflow(run.id, user.id);
  } catch (error) {
    logger.error("Create run failed", error, { userId: user.id });
    redirectToError("workflow");
  }
  revalidatePath("/");
  redirect(`/runs/${runId}/progress`);
}

export async function startRunAction(formData: FormData) {
  await requireAuth();
  const user = await getLocalUser();
  const config = getGuardrailConfig();
  const rate = checkRateLimit({
    key: `${user.id}:retry-run`,
    limit: config.sources.runRetryRateLimit,
  });
  if (!rate.ok) {
    redirectToError("rate_limit");
  }
  const runId = String(formData.get("runId") ?? "");
  try {
    await startPrepWorkflow(runId, user.id);
  } catch (error) {
    logger.error("Start run failed", error, { userId: user.id, runId });
    redirectToError("workflow");
  }
  revalidatePath(`/runs/${runId}/progress`);
  redirect(`/runs/${runId}/progress`);
}

export async function retryFailedRunAction(formData: FormData) {
  await startRunAction(formData);
}

export async function deleteRunAction(formData: FormData) {
  await requireAuth();
  const user = await getLocalUser();
  const runId = String(formData.get("runId") ?? "");
  await deleteRun(user.id, runId);
  revalidatePath("/");
  redirect("/");
}
