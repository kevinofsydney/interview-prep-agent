export type Evidence = {
  sourceId?: string;
  sourceType: "user_source" | "web" | "resume" | "inference";
  quote?: string;
  confidence: "high" | "medium" | "low";
};

export type Report = {
  title: string;
  subtitle: string;
  sourceCount: number;
  sections: ReportSection[];
  cheatSheet: {
    title: string;
    contentMarkdown: string;
    evidence?: Evidence[];
  };
};

export type ReportSection = {
  id: string;
  title: string;
  summary: string;
  subsections: ReportSubsection[];
  callouts: ReportCallout[];
  tables: ReportTable[];
  images?: ReportImage[];
  evidence?: Evidence[];
};

export type ReportSubsection = {
  id: string;
  title: string;
  contentMarkdown: string;
  evidence?: Evidence[];
};

export type ReportCallout = {
  type: "say_this" | "avoid_this" | "remember" | "risk" | "source_note" | "example";
  title: string;
  content: string;
  evidence?: Evidence[];
};

export type ReportTable = {
  title: string;
  columns: string[];
  rows: string[][];
  evidence?: Evidence[];
};

export type ReportImage = {
  url: string;
  alt: string;
  source: string;
  license: string;
  attribution: string;
};
