"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAuthCookies, getAccessPassword, requireAuth, setAuthCookies } from "@/lib/auth";
import { getGuardrailConfig } from "@/lib/guardrails/config";
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
  const input = newRunSchema.parse(formDataToNewRunInput(formData));
  const config = getGuardrailConfig();
  const sourceText = input.sourceText?.trim() ?? "";
  const sourceCount = sourceText ? 1 : 0;
  const sourceTokens = sourceText ? estimateTokens(sourceText) : 0;

  const sourceLimit = evaluateSourceRunLimits(
    { sources: sourceCount, urls: 0, files: 0, chunks: sourceCount },
    config,
  );
  if (!sourceLimit.ok) {
    throw new Error(sourceLimit.reason);
  }
  if (sourceTokens > config.sources.maxExtractedTextTokensPerSource) {
    throw new Error("Source text exceeds per-source token limit");
  }

  const totalInputTokens =
    estimateTokens(input.jobDescription) +
    estimateTokens(input.resumeText) +
    estimateTokens(input.recruiterNotes ?? "") +
    sourceTokens;

  if (totalInputTokens > config.run.maxInputTokens) {
    throw new Error("Run input token budget exceeded");
  }

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

  await startPrepWorkflow(run.id, user.id);
  revalidatePath("/");
  redirect(`/runs/${run.id}/progress`);
}

export async function startRunAction(formData: FormData) {
  await requireAuth();
  const user = await getLocalUser();
  const runId = String(formData.get("runId") ?? "");
  await startPrepWorkflow(runId, user.id);
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
