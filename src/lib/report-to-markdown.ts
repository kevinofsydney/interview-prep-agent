import type { Report } from "@/lib/report-types";

export function reportToMarkdown(report: Report) {
  const lines: string[] = [`# ${report.title}`, "", report.subtitle, ""];

  for (const section of report.sections) {
    lines.push(`## ${section.title}`, "", section.summary, "");

    for (const callout of section.callouts) {
      lines.push(`> ${callout.title}: ${callout.content}`, "");
    }

    for (const subsection of section.subsections) {
      lines.push(`### ${subsection.title}`, "", subsection.contentMarkdown, "");
    }

    for (const table of section.tables) {
      lines.push(`### ${table.title}`, "");
      lines.push(`| ${table.columns.join(" | ")} |`);
      lines.push(`| ${table.columns.map(() => "---").join(" | ")} |`);
      for (const row of table.rows) {
        lines.push(`| ${row.join(" | ")} |`);
      }
      lines.push("");
    }
  }

  lines.push(`## ${report.cheatSheet.title}`, "", report.cheatSheet.contentMarkdown, "");

  return lines.join("\n");
}
