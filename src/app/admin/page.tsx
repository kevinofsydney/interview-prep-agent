import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminUsage, getLocalUser } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getLocalUser();
  const { runs, usage } = await adminUsage(user.id);

  const totals = usage.reduce(
    (acc, item) => {
      acc.input += item.inputTokens;
      acc.output += item.outputTokens;
      acc.cost += item.estimatedCostUsd;
      return acc;
    },
    { input: 0, output: 0, cost: 0 },
  );

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 flex items-center justify-between border-b border-[#ded9cc] pb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#175a63]">
            <ArrowLeft size={16} />
            Runs
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="/admin/usage.csv"
              className="rounded-md border border-[#c9c1b2] bg-[#fffdf8] px-3 py-2 text-sm font-semibold hover:border-[#175a63]"
            >
              Export CSV
            </a>
            <p className="text-sm text-[#6c6a63]">Local admin usage view</p>
          </div>
        </nav>

        <header className="mb-6">
          <h1 className="text-4xl font-semibold">Usage and Cost</h1>
          <p className="mt-3 text-[#6c6a63]">
            Redacted admin view of tokens, models, approximate costs, and job-level usage.
            Raw prompts, resume text, source chunks, and secrets are hidden by default.
          </p>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <Metric label="Input tokens" value={totals.input.toLocaleString()} />
          <Metric label="Output tokens" value={totals.output.toLocaleString()} />
          <Metric label="Estimated cost" value={`$${totals.cost.toFixed(4)}`} />
        </section>

        <section className="mb-8 rounded-lg border border-[#ded9cc] bg-[#fffdf8]">
          <div className="border-b border-[#ded9cc] px-4 py-3 font-semibold">Job-level usage</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#f2eadb]">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tasks</th>
                  <th className="px-4 py-3">Input</th>
                  <th className="px-4 py-3">Output</th>
                  <th className="px-4 py-3">Cost</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-t border-[#ebe5d8]">
                    <td className="px-4 py-3">
                      <Link href={`/runs/${run.id}/progress`} className="font-medium text-[#175a63]">
                        {run.companyName} - {run.roleTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{run.status}</td>
                    <td className="px-4 py-3">{run.tasks.length}</td>
                    <td className="px-4 py-3">{run.inputTokens.toLocaleString()}</td>
                    <td className="px-4 py-3">{run.outputTokens.toLocaleString()}</td>
                    <td className="px-4 py-3">${run.estimatedCostUsd.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-[#ded9cc] bg-[#fffdf8]">
          <div className="border-b border-[#ded9cc] px-4 py-3 font-semibold">Agent/model usage</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#f2eadb]">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Input</th>
                  <th className="px-4 py-3">Output</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((item) => (
                  <tr key={item.id} className="border-t border-[#ebe5d8]">
                    <td className="px-4 py-3">{item.jobRun?.companyName ?? "Deleted run"}</td>
                    <td className="px-4 py-3">{item.agentTask?.agent ?? "Deleted task"}</td>
                    <td className="px-4 py-3">{item.provider}</td>
                    <td className="px-4 py-3">{item.model}</td>
                    <td className="px-4 py-3">{item.inputTokens.toLocaleString()}</td>
                    <td className="px-4 py-3">{item.outputTokens.toLocaleString()}</td>
                    <td className="px-4 py-3">${item.estimatedCostUsd.toFixed(4)}</td>
                    <td className="px-4 py-3">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6c6a63]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
