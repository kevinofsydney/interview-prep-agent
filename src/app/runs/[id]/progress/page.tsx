import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, Clock3, XCircle } from "lucide-react";
import { deleteRunAction, retryFailedRunAction, startRunAction } from "@/app/actions";
import { getGuardrailConfig } from "@/lib/guardrails/config";
import { getLocalUser, getRun } from "@/lib/store";

export default async function RunProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getLocalUser();
  const guardrails = getGuardrailConfig();
  const run = await getRun(user.id, id);

  if (!run) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex items-center justify-between border-b border-[#ded9cc] pb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#175a63]">
            <ArrowLeft size={16} />
            Runs
          </Link>
          <div className="flex gap-2">
            {run.report ? (
              <Link href={`/runs/${run.id}/report`} className="inline-flex items-center gap-2 rounded-md bg-[#175a63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f3f45]">
                Open report
                <ArrowRight size={16} />
              </Link>
            ) : (
              <form action={run.status === "failed" ? retryFailedRunAction : startRunAction}>
                <input type="hidden" name="runId" value={run.id} />
                <button className="rounded-md bg-[#175a63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f3f45]">
                  {run.status === "failed" ? "Retry run" : "Start run"}
                </button>
              </form>
            )}
          </div>
        </nav>

        <header className="mb-8 max-w-3xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#175a63]">
            {run.status}
          </p>
          <h1 className="mb-3 text-4xl font-semibold">{run.companyName} - {run.roleTitle}</h1>
          <p className="text-lg leading-8 text-[#5f5b51]">
            {run.statusReason ?? "Workflow status, agent progress, budget usage, and model usage."}
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {run.tasks.length === 0 ? (
            <div className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5 text-sm text-[#6c6a63]">
              No tasks yet.
            </div>
          ) : (
            run.tasks.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((task) => (
              <article key={task.id} className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{task.agent}</h2>
                    <p className="mt-1 text-sm text-[#6c6a63]">
                      {task.inputTokens.toLocaleString()} in · {task.outputTokens.toLocaleString()} out · ${task.estimatedCost.toFixed(4)}
                    </p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <p className="text-sm leading-6 text-[#4b4943]">{task.description}</p>
                {task.errorMessage ? <p className="mt-3 text-sm text-[#8f2f2f]">{task.errorMessage}</p> : null}
                {task.model ? <p className="mt-3 text-xs text-[#6c6a63]">Model: {task.model}</p> : null}
              </article>
            ))
          )}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <Metric label="Estimated cost" value={`$${run.estimatedCostUsd.toFixed(4)}`} />
          <Metric label="Input tokens" value={run.inputTokens.toLocaleString()} />
          <Metric label="Output tokens" value={run.outputTokens.toLocaleString()} />
        </section>

        <div className="mt-6 rounded-lg border border-[#ded9cc] bg-[#ebe5d8] p-5">
          <h2 className="mb-2 font-semibold">Active budget caps</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Run cost" value={`$${guardrails.run.maxCostUsd}`} />
            <Metric label="Duration" value={`${guardrails.run.maxDurationSeconds}s`} />
            <Metric label="Sources" value={`${guardrails.sources.maxSourcesPerRun}`} />
            <Metric label="Retries" value={`${guardrails.run.maxAgentRetries}`} />
          </dl>
        </div>

        <form action={deleteRunAction} className="mt-6">
          <input type="hidden" name="runId" value={run.id} />
          <button className="rounded-md border border-[#c9c1b2] px-4 py-2 text-sm font-semibold hover:border-[#8f2f2f]">
            Delete prep run
          </button>
        </form>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#d2cabd] bg-[#fffdf8] px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6c6a63]">{label}</dt>
      <dd className="mt-1 font-semibold text-[#171717]">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config =
    status === "completed"
      ? { icon: <CheckCircle2 size={16} />, className: "bg-[#dfeee8] text-[#1f6b49]" }
      : status === "running"
        ? { icon: <Clock3 size={16} />, className: "bg-[#e2eef0] text-[#175a63]" }
        : status === "failed"
          ? { icon: <XCircle size={16} />, className: "bg-[#f5e6e2] text-[#8f2f2f]" }
          : { icon: <CircleDashed size={16} />, className: "bg-[#f2eadb] text-[#8a4b10]" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      {config.icon}
      {status}
    </span>
  );
}
