import { ReportLayout } from "@/components/report/report-layout";
import { sampleReport } from "@/lib/sample-report";

export default function ReportPage() {
  return <ReportLayout report={sampleReport} />;
}
