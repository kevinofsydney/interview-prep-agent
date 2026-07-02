import { notFound } from "next/navigation";
import { ReportLayout } from "@/components/report/report-layout";
import { getGuardrailConfig } from "@/lib/guardrails/config";
import { reportSchema } from "@/lib/report-schema";
import { getLocalUser, getReport } from "@/lib/store";

export default async function RunReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getLocalUser();
  const report = await getReport(user.id, id);

  if (!report) {
    notFound();
  }

  const parsed = reportSchema.parse(report.reportJson);
  return <ReportLayout report={parsed} guardrails={getGuardrailConfig()} />;
}
