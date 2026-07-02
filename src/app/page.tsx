import Link from "next/link";
import { ArrowRight, FileText, LockKeyhole, ShieldCheck } from "lucide-react";

const stageOptions = [
  "Recruiter screen",
  "Hiring manager interview",
  "Technical / case interview",
  "Peer interview",
  "Executive / founder interview",
  "Final round",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <nav className="mb-10 flex items-center justify-between border-b border-[#ded9cc] pb-4">
            <div>
              <p className="text-sm font-semibold text-[#175a63]">Interview Prep Agent</p>
              <p className="text-xs text-[#6c6a63]">Local-first MVP shell</p>
            </div>
            <Link
              href="/runs/demo/report"
              className="inline-flex items-center gap-2 rounded-md border border-[#c9c1b2] bg-[#fffdf8] px-3 py-2 text-sm font-medium text-[#171717] hover:border-[#175a63]"
            >
              View mock report
              <ArrowRight size={16} />
            </Link>
          </nav>

          <div className="mb-8 max-w-3xl">
            <h1 className="mb-4 text-4xl font-semibold leading-tight text-[#171717] sm:text-5xl">
              Build a focused prep pack before the interview.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#4b4943]">
              Add the role, resume, interview context, and useful sources. The MVP
              turns that context into a structured report instead of a chat thread.
            </p>
          </div>

          <form className="grid gap-5">
            <section className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Role Details</h2>
                  <p className="text-sm text-[#6c6a63]">The minimum context needed to frame the run.</p>
                </div>
                <FileText className="text-[#175a63]" size={20} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Company name
                  <input className="rounded-md border border-[#c9c1b2] bg-white px-3 py-2" placeholder="Sierra" />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Role title
                  <input className="rounded-md border border-[#c9c1b2] bg-white px-3 py-2" placeholder="Agent Strategist" />
                </label>
              </div>
              <label className="mt-4 grid gap-2 text-sm font-medium">
                Job description
                <textarea
                  className="min-h-36 rounded-md border border-[#c9c1b2] bg-white px-3 py-2"
                  placeholder="Paste the job description here."
                />
              </label>
            </section>

            <section className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
              <h2 className="mb-1 text-lg font-semibold">Candidate Profile</h2>
              <p className="mb-4 text-sm text-[#6c6a63]">For the first milestone, pasted text is enough.</p>
              <label className="grid gap-2 text-sm font-medium">
                Resume or profile
                <textarea
                  className="min-h-40 rounded-md border border-[#c9c1b2] bg-white px-3 py-2"
                  placeholder="Paste resume, LinkedIn summary, or candidate notes."
                />
              </label>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
                <h2 className="mb-4 text-lg font-semibold">Interview Context</h2>
                <label className="grid gap-2 text-sm font-medium">
                  Interview stage
                  <select className="rounded-md border border-[#c9c1b2] bg-white px-3 py-2">
                    {stageOptions.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 grid gap-2 text-sm font-medium">
                  Recruiter or interviewer notes
                  <textarea className="min-h-28 rounded-md border border-[#c9c1b2] bg-white px-3 py-2" />
                </label>
              </div>

              <div className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
                <h2 className="mb-4 text-lg font-semibold">Useful Sources</h2>
                <label className="grid gap-2 text-sm font-medium">
                  Pasted source notes
                  <textarea
                    className="min-h-40 rounded-md border border-[#c9c1b2] bg-white px-3 py-2"
                    placeholder="Paste company notes, recruiter emails, annual report excerpts, or interview prep material."
                  />
                </label>
              </div>
            </section>

            <div className="flex flex-col gap-3 rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Static milestone</h2>
                <p className="text-sm text-[#6c6a63]">
                  This button routes to mock progress before real run storage and LLM calls exist.
                </p>
              </div>
              <Link
                href="/runs/demo/progress"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#175a63] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3f45]"
              >
                Start mock run
                <ArrowRight size={16} />
              </Link>
            </div>
          </form>
        </section>

        <aside className="border-t border-[#ded9cc] bg-[#ebe5d8] px-5 py-8 lg:border-l lg:border-t-0 lg:px-7">
          <div className="sticky top-8 grid gap-4">
            <InfoCard
              icon={<LockKeyhole size={20} />}
              title="MVP access"
              body="The implementation path uses a shared password gate first, then real auth when multi-user hosting matters."
            />
            <InfoCard
              icon={<ShieldCheck size={20} />}
              title="Cost controls first"
              body="Real model calls stay blocked until per-run and daily caps, token limits, and usage logging are wired in."
            />
            <div className="rounded-lg border border-[#d2cabd] bg-[#fffdf8] p-4">
              <p className="mb-2 text-sm font-semibold">Default model route</p>
              <p className="text-sm leading-6 text-[#5f5b51]">
                OpenRouter first, with research, synthesis, and final model roles configured by environment variables.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
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
