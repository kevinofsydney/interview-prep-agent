import { getLocalUser, adminUsage } from "@/lib/store";

export async function GET() {
  const user = await getLocalUser();
  const { usage } = await adminUsage(user.id);
  const rows = [
    [
      "created_at",
      "job_run_id",
      "company",
      "role",
      "agent",
      "provider",
      "model",
      "input_tokens",
      "output_tokens",
      "estimated_cost_usd",
      "status",
    ],
    ...usage.map((item) => [
      item.createdAt,
      item.jobRunId,
      item.jobRun?.companyName ?? "",
      item.jobRun?.roleTitle ?? "",
      item.agentTask?.agent ?? "",
      item.provider,
      item.model,
      String(item.inputTokens),
      String(item.outputTokens),
      item.estimatedCostUsd.toFixed(6),
      item.status,
    ]),
  ];

  return new Response(rows.map((row) => row.map(csvCell).join(",")).join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"interview-prep-usage.csv\"",
    },
  });
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

