import { ReportLayout } from "@/components/report/report-layout";
import { getGuardrailConfig } from "@/lib/guardrails/config";
import { sampleReport } from "@/lib/sample-report";

export default function ReportPage() {
  return <ReportLayout report={sampleReport} guardrails={getGuardrailConfig()} />;
}
