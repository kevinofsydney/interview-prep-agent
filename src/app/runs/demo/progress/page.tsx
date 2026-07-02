import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Clock3 } from "lucide-react";
import { getGuardrailConfig } from "@/lib/guardrails/config";

const tasks = [
  {
    name: "Source Ingestion",
    status: "Completed",
    description: "Normalized pasted resume, job description, and source notes.",
    meta: "3 source blocks",
  },
  {
    name: "Source Extraction",
    status: "Completed",
    description: "Pulled interview-relevant facts, quotes, risks, and implications.",
    meta: "High confidence",
  },
  {
    name: "Role Decoder",
    status: "Completed",
    description: "Mapped explicit responsibilities to hidden expectations and success signals.",
    meta: "12 signals",
  },
  {
    name: "Candidate Match",
    status: "Completed",
    description: "Connected resume evidence to the role and identified likely objections.",
    meta: "6 proof points",
  },
  {
    name: "Candidate Pitch",
    status: "Completed",
    description: "Drafted positioning, interview answers, and emphasis guidance.",
    meta: "Ready",
  },
  {
    name: "Interview Questions",
    status: "Completed",
    description: "Generated likely questions and strong questions to ask by interviewer type.",
    meta: "18 questions",
  },
  {
    name: "Final Report Assembly",
    status: "Running",
    description: "Combining agent outputs into a skimmable report module.",
    meta: "Mock mode",
  },
  {
    name: "Report Quality Check",
    status: "Queued",
    description: "Will check section coverage, specificity, evidence labels, and generic phrasing.",
    meta: "Next",
  },
];

export default function ProgressPage() {
  const guardrails = getGuardrailConfig();

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex items-center justify-between border-b border-[#ded9cc] pb-4">
          <Link href="/" className="text-sm font-medium text-[#175a63]">
            Interview Prep Agent
          </Link>
          <Link
            href="/runs/demo/report"
            className="inline-flex items-center gap-2 rounded-md bg-[#175a63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f3f45]"
          >
            Open report
            <ArrowRight size={16} />
          </Link>
        </nav>

        <header className="mb-8 max-w-3xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#175a63]">
            Mock run
          </p>
          <h1 className="mb-3 text-4xl font-semibold">Building your prep pack</h1>
          <p className="text-lg leading-8 text-[#5f5b51]">
            This screen shows the intended workflow states before live agents, storage,
            and cost tracking are wired in.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <article key={task.name} className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{task.name}</h2>
                  <p className="mt-1 text-sm text-[#6c6a63]">{task.meta}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
              <p className="text-sm leading-6 text-[#4b4943]">{task.description}</p>
            </article>
          ))}
        </section>

        <div className="mt-6 rounded-lg border border-[#ded9cc] bg-[#ebe5d8] p-5">
          <h2 className="mb-2 font-semibold">Cost guardrail preview</h2>
          <p className="text-sm leading-6 text-[#5f5b51]">
            Real runs will estimate token usage before each model call and stop when
            configured per-run or daily spend caps are reached.
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <LimitItem label="Run cost" value={`$${guardrails.run.maxCostUsd}`} />
            <LimitItem label="Duration" value={`${guardrails.run.maxDurationSeconds}s`} />
            <LimitItem label="Sources" value={`${guardrails.sources.maxSourcesPerRun}`} />
            <LimitItem label="Retries" value={`${guardrails.run.maxAgentRetries}`} />
            <LimitItem
              label="Final report"
              value={`${guardrails.agentOutputTokens.finalReport.toLocaleString()} tokens`}
            />
            <LimitItem
              label="Questions"
              value={`${guardrails.agentOutputTokens.interviewQuestions.toLocaleString()} tokens`}
            />
            <LimitItem label="Web searches" value={`${guardrails.sources.maxWebSearchesPerRun}`} />
            <LimitItem label="Fetched pages" value={`${guardrails.sources.maxFetchedPagesPerRun}`} />
          </dl>
        </div>
      </div>
    </main>
  );
}

function LimitItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#d2cabd] bg-[#fffdf8] px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6c6a63]">{label}</dt>
      <dd className="mt-1 font-semibold text-[#171717]">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config =
    status === "Completed"
      ? { icon: <CheckCircle2 size={16} />, className: "bg-[#dfeee8] text-[#1f6b49]" }
      : status === "Running"
        ? { icon: <Clock3 size={16} />, className: "bg-[#e2eef0] text-[#175a63]" }
        : { icon: <CircleDashed size={16} />, className: "bg-[#f2eadb] text-[#8a4b10]" };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      {config.icon}
      {status}
    </span>
  );
}
