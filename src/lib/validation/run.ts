import { z } from "zod";

export const interviewStages = [
  "Recruiter screen",
  "Hiring manager interview",
  "Technical / case interview",
  "Peer interview",
  "Executive / founder interview",
  "Final round",
  "Unknown",
] as const;

export const newRunSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(120),
  roleTitle: z.string().trim().min(1, "Role title is required").max(160),
  jobDescription: z.string().trim().min(20, "Paste at least 20 characters of job description"),
  resumeText: z.string().trim().min(20, "Paste at least 20 characters of resume or profile"),
  interviewStage: z.enum(interviewStages),
  recruiterNotes: z.string().trim().max(12000).optional().or(z.literal("")),
  sourceTitle: z.string().trim().max(160).optional().or(z.literal("")),
  sourceText: z.string().trim().max(120000).optional().or(z.literal("")),
});

export type NewRunInput = z.infer<typeof newRunSchema>;

export function formDataToNewRunInput(formData: FormData): NewRunInput {
  return {
    companyName: String(formData.get("companyName") ?? ""),
    roleTitle: String(formData.get("roleTitle") ?? ""),
    jobDescription: String(formData.get("jobDescription") ?? ""),
    resumeText: String(formData.get("resumeText") ?? ""),
    interviewStage: String(formData.get("interviewStage") ?? "Unknown") as NewRunInput["interviewStage"],
    recruiterNotes: String(formData.get("recruiterNotes") ?? ""),
    sourceTitle: String(formData.get("sourceTitle") ?? ""),
    sourceText: String(formData.get("sourceText") ?? ""),
  };
}

