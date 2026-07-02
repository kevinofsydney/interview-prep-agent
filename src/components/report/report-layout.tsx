"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Check, Clipboard, Download, FileText } from "lucide-react";
import type { Report, ReportCallout } from "@/lib/report-types";
import { reportToMarkdown } from "@/lib/report-to-markdown";

export function ReportLayout({ report }: { report: Report }) {
  const [activeId, setActiveId] = useState(report.sections[0]?.id ?? "");
  const markdown = useMemo(() => reportToMarkdown(report), [report]);

  useEffect(() => {
    const observers = report.sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    observers.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [report.sections]);

  return (
    <main className="min-h-screen bg-[#f7f5f0]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_260px]">
        <aside className="border-b border-[#ded9cc] bg-[#ebe5d8] px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-6">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#175a63]">
            <ArrowLeft size={16} />
            New prep run
          </Link>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6c6a63]">
              Interview Prep Pack
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight">{report.title}</h1>
            <p className="mt-2 text-sm leading-6 text-[#5f5b51]">{report.subtitle}</p>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible">
            {report.sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`min-w-fit rounded-md px-3 py-2 text-sm lg:min-w-0 ${
                  activeId === section.id
                    ? "bg-[#175a63] font-semibold text-white"
                    : "text-[#3f3c36] hover:bg-[#fffdf8]"
                }`}
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="px-5 py-7 sm:px-8 lg:px-12">
          <header className="mb-8 border-b border-[#ded9cc] pb-8">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#dfeee8] px-3 py-1 text-sm font-semibold text-[#1f6b49]">
              <FileText size={15} />
              {report.sourceCount} sources in mock report
            </p>
            <h2 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              {report.title}
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[#5f5b51]">{report.subtitle}</p>
          </header>

          <div className="grid gap-8">
            {report.sections.map((section) => (
              <section
                id={section.id}
                key={section.id}
                className="scroll-mt-6 rounded-lg border border-[#ded9cc] bg-[#fffdf8] p-5 sm:p-7"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold">{section.title}</h2>
                  <p className="mt-2 text-base leading-7 text-[#5f5b51]">{section.summary}</p>
                </div>

                <div className="grid gap-5">
                  {section.callouts.map((callout) => (
                    <ReportCalloutView key={`${section.id}-${callout.title}`} callout={callout} />
                  ))}

                  {section.subsections.map((subsection) => (
                    <div key={subsection.id} className="border-t border-[#ebe5d8] pt-5">
                      <h3 className="mb-3 text-lg font-semibold">{subsection.title}</h3>
                      <div className="prose-lite text-[#38352f]">
                        <ReactMarkdown>{subsection.contentMarkdown}</ReactMarkdown>
                      </div>
                    </div>
                  ))}

                  {section.tables.map((table) => (
                    <div key={table.title} className="overflow-hidden rounded-lg border border-[#ded9cc]">
                      <div className="border-b border-[#ded9cc] bg-[#f2eadb] px-4 py-3 font-semibold">
                        {table.title}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                          <thead>
                            <tr className="bg-[#fbf8f1]">
                              {table.columns.map((column) => (
                                <th key={column} className="border-b border-[#ded9cc] px-4 py-3 font-semibold">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row) => (
                              <tr key={row.join("-")} className="align-top">
                                {row.map((cell) => (
                                  <td key={cell} className="border-b border-[#ebe5d8] px-4 py-3 leading-6 text-[#4b4943]">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section id="cheat-sheet" className="rounded-lg border border-[#175a63] bg-[#e2eef0] p-5 sm:p-7">
              <h2 className="mb-4 text-2xl font-semibold">{report.cheatSheet.title}</h2>
              <div className="prose-lite text-[#243d40]">
                <ReactMarkdown>{report.cheatSheet.contentMarkdown}</ReactMarkdown>
              </div>
            </section>
          </div>
        </article>

        <aside className="border-t border-[#ded9cc] bg-[#ebe5d8] px-5 py-6 lg:sticky lg:top-0 lg:h-screen lg:border-l lg:border-t-0">
          <div className="grid gap-3">
            <CopyButton text={markdown} />
            <DownloadButton text={markdown} fileName="interview-prep-pack.md" />
            <div className="rounded-lg border border-[#d2cabd] bg-[#fffdf8] p-4">
              <p className="text-sm font-semibold">Evidence mode</p>
              <p className="mt-2 text-sm leading-6 text-[#5f5b51]">
                This mock report includes source chips and confidence labels in the data model.
                Real runs will enforce evidence metadata before final assembly.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ReportCalloutView({ callout }: { callout: ReportCallout }) {
  const styles: Record<ReportCallout["type"], string> = {
    say_this: "border-[#175a63] bg-[#e2eef0]",
    avoid_this: "border-[#8f2f2f] bg-[#f5e6e2]",
    remember: "border-[#6f6a35] bg-[#f3f0d7]",
    risk: "border-[#8a4b10] bg-[#f2eadb]",
    source_note: "border-[#6c6a63] bg-[#f4f1ea]",
    example: "border-[#175a63] bg-[#eaf3ef]",
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 ${styles[callout.type]}`}>
      <p className="mb-1 text-sm font-semibold uppercase tracking-[0.12em] text-[#4b4943]">
        {callout.type.replace("_", " ")}
      </p>
      <h3 className="font-semibold">{callout.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#38352f]">{callout.content}</p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#175a63] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3f45]"
    >
      {copied ? <Check size={16} /> : <Clipboard size={16} />}
      {copied ? "Copied" : "Copy markdown"}
    </button>
  );
}

function DownloadButton({ text, fileName }: { text: string; fileName: string }) {
  function handleDownload() {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-[#c9c1b2] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold hover:border-[#175a63]"
    >
      <Download size={16} />
      Export markdown
    </button>
  );
}
