import Link from "next/link";
import { ArrowRight, FileText, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";
import { createRunAction, deleteRunAction, logoutAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { getGuardrailConfig } from "@/lib/guardrails/config";
import { getLocalUser, listRuns } from "@/lib/store";
import { interviewStages } from "@/lib/validation/run";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getLocalUser();
  const guardrails = getGuardrailConfig();
  const runs = (await listRuns(user.id)).slice(0, 12);

  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <nav className="mb-10 flex items-center justify-between border-b border-[#ded9cc] pb-4">
            <div>
              <p className="text-sm font-semibold text-[#175a63]">Interview Prep Agent</p>
              <p className="text-xs text-[#6c6a63]">Local-first MVP</p>
            </div>
            <form action={logoutAction}>
              <button className="rounded-md border border-[#c9c1b2] bg-[#fffdf8] px-3 py-2 text-sm font-medium hover:border-[#175a63]">
                Log out
              </button>
            </form>
          </nav>

          <div className="mb-8 max-w-3xl">
            <h1 className="mb-4 text-4xl font-semibold leading-tight text-[#171717] sm:text-5xl">
              Build a focused prep pack before the interview.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#4b4943]">
              Add role, resume, interview context, and source notes. The MVP generates
              a persisted, source-aware report with guardrails and usage tracking.
            </p>
          </div>

          <form action={createRunAction} className="grid gap-5">
            <section className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Role Details</h2>
                  <p className="text-sm text-[#6c6a63]">Required context for a prep run.</p>
                </div>
                <FileText className="text-[#175a63]" size={20} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Company name
                  <input name="companyName" required className="rounded-md border border-[#c9c1b2] bg-white px-3 py-2" placeholder="Sierra" />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Role title
                  <input name="roleTitle" required className="rounded-md border border-[#c9c1b2] bg-white px-3 py-2" placeholder="Agent Strategist" />
                </label>
              </div>
              <label className="mt-4 grid gap-2 text-sm font-medium">
                Job description
                <textarea name="jobDescription" required className="min-h-36 rounded-md border border-[#c9c1b2] bg-white px-3 py-2" placeholder="Paste the job description here." />
              </label>
            </section>

            <section className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
              <h2 className="mb-1 text-lg font-semibold">Candidate Profile</h2>
              <p className="mb-4 text-sm text-[#6c6a63]">Pasted resume/profile text is enough for MVP.</p>
              <label className="grid gap-2 text-sm font-medium">
                Resume or profile
                <textarea name="resumeText" required className="min-h-40 rounded-md border border-[#c9c1b2] bg-white px-3 py-2" placeholder="Paste resume, LinkedIn summary, or candidate notes." />
              </label>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
                <h2 className="mb-4 text-lg font-semibold">Interview Context</h2>
                <label className="grid gap-2 text-sm font-medium">
                  Interview stage
                  <select name="interviewStage" className="rounded-md border border-[#c9c1b2] bg-white px-3 py-2">
                    {interviewStages.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 grid gap-2 text-sm font-medium">
                  Recruiter or interviewer notes
                  <textarea name="recruiterNotes" className="min-h-28 rounded-md border border-[#c9c1b2] bg-white px-3 py-2" />
                </label>
              </div>

              <div className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
                <h2 className="mb-4 text-lg font-semibold">Useful Sources</h2>
                <label className="grid gap-2 text-sm font-medium">
                  Source title
                  <input name="sourceTitle" className="rounded-md border border-[#c9c1b2] bg-white px-3 py-2" placeholder="Recruiter notes, company blog, annual report excerpt" />
                </label>
                <label className="mt-4 grid gap-2 text-sm font-medium">
                  Pasted source notes
                  <textarea name="sourceText" className="min-h-32 rounded-md border border-[#c9c1b2] bg-white px-3 py-2" placeholder="Paste source material. It will be treated as untrusted evidence." />
                </label>
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Start guarded workflow</h2>
                <p className="text-sm text-[#6c6a63]">
                  Uses local persistence, budget caps, agent tasks, report validation, and usage tracking.
                </p>
              </div>
              <SubmitButton
                pendingLabel="Creating run..."
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#175a63] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3f45] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Create prep run
                <ArrowRight size={16} />
              </SubmitButton>
            </div>
          </form>

          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold">Saved Runs</h2>
            <div className="grid gap-3">
              {runs.length === 0 ? (
                <div className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5 text-sm text-[#6c6a63]">
                  No runs yet. Create one above.
                </div>
              ) : (
                runs.map((run) => (
                  <article key={run.id} className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold">{run.companyName} - {run.roleTitle}</h3>
                        <p className="mt-1 text-sm text-[#6c6a63]">
                          {run.status} · {run.tasks.length} tasks · ${run.estimatedCostUsd.toFixed(4)} est.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/runs/${run.id}/progress`} className="rounded-md border border-[#c9c1b2] px-3 py-2 text-sm font-medium hover:border-[#175a63]">
                          Progress
                        </Link>
                        {run.report ? (
                          <Link href={`/runs/${run.id}/report`} className="rounded-md bg-[#175a63] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0f3f45]">
                            Report
                          </Link>
                        ) : null}
                        <form action={deleteRunAction}>
                          <input type="hidden" name="runId" value={run.id} />
                          <button className="inline-flex items-center gap-1 rounded-md border border-[#c9c1b2] px-3 py-2 text-sm font-medium hover:border-[#8f2f2f]">
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>

        <aside className="border-t border-[#ded9cc] bg-[#ebe5d8] px-5 py-8 lg:border-l lg:border-t-0 lg:px-7">
          <div className="sticky top-8 grid gap-4">
            <InfoCard icon={<LockKeyhole size={20} />} title="MVP access" body="Protected by a shared password gate. Real user auth comes later." />
            <InfoCard icon={<ShieldCheck size={20} />} title="Active guardrails" body={`$${guardrails.run.maxCostUsd} run cap, ${guardrails.sources.maxSourcesPerRun} sources, ${guardrails.run.maxAgentRetries} retry.`} />
            <Link href="/admin" className="rounded-lg border border-[#d2cabd] bg-[#fffdf8] p-4 text-sm font-semibold hover:border-[#175a63]">
              Admin usage view
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[#d2cabd] bg-[#fffdf8] p-4">
      <div className="mb-3 flex items-center gap-2 text-[#175a63]">
        {icon}
        <p className="font-semibold text-[#171717]">{title}</p>
      </div>
      <p className="text-sm leading-6 text-[#5f5b51]">{body}</p>
    </div>
  );
}
