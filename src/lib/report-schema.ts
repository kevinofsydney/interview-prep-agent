import { z } from "zod";

export const evidenceSchema = z.object({
  sourceId: z.string().optional(),
  sourceType: z.enum(["user_source", "web", "resume", "inference"]),
  quote: z.string().optional(),
  confidence: z.enum(["high", "medium", "low"]),
});

export const reportCalloutSchema = z.object({
  type: z.enum(["say_this", "avoid_this", "remember", "risk", "source_note", "example"]),
  title: z.string(),
  content: z.string(),
  evidence: z.array(evidenceSchema).optional(),
});

export const reportTableSchema = z.object({
  title: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  evidence: z.array(evidenceSchema).optional(),
});

export const reportSubsectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  contentMarkdown: z.string(),
  evidence: z.array(evidenceSchema).optional(),
});

export const reportSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  subsections: z.array(reportSubsectionSchema),
  callouts: z.array(reportCalloutSchema),
  tables: z.array(reportTableSchema),
  images: z.array(z.object({
    url: z.string(),
    alt: z.string(),
    source: z.string(),
    license: z.string(),
    attribution: z.string(),
  })).optional(),
  evidence: z.array(evidenceSchema).optional(),
});

export const reportSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  sourceCount: z.number().int().nonnegative(),
  sections: z.array(reportSectionSchema).min(1),
  cheatSheet: z.object({
    title: z.string(),
    contentMarkdown: z.string(),
    evidence: z.array(evidenceSchema).optional(),
  }),
});

