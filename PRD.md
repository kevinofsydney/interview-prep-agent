# Interview Prep Agent MVP PRD

## 1. Product Summary

Interview Prep Agent is a web application that helps a candidate prepare for a specific job interview by generating a structured, source-grounded interview prep report.

The MVP is a workflow app, not a chat app. The user provides role, company, candidate, interview, and source context. The system runs a deterministic AI workflow and produces a curated reading module that helps the candidate understand what to know, say, ask, and rehearse before the interview.

The MVP has three primary screens:

1. Input screen
2. Agent progress screen
3. Report reading screen

The final report should feel like a practical interview prep module, not a dense AI-generated document. It should use short sections, sidebar navigation, callouts, tables, source chips, and clear coaching guidance.

## 2. MVP Goal

Given a candidate, company, role, job description, interview stage, and useful source material, the app should produce a report that answers:

> What should this candidate know, say, ask, and rehearse before this interview?

The output should be specific enough to use directly before an interview.

## 3. MVP Scope Lock

The first working MVP should prioritize source-grounded report generation from user-provided inputs:

- Company name
- Role title
- Job description text
- Resume or candidate profile text
- Interview stage
- Optional pasted notes and source material

The first MVP does not need live web research, competitor research, image selection, compensation research, or advanced file parsing to be useful. Those are enhancement layers after the core workflow is working.

The app is acceptable if it can produce an excellent structured report from resume text, job description text, and user-provided source text alone.

## 4. Product Principles

### 4.1 Workflow App, Not Chat App

The MVP should follow a guided flow:

```text
User inputs context -> workflow runs -> user reads structured report
```

Chat is out of scope for MVP. It can be added later for:

- Asking questions about the report
- Quizzing the candidate
- Rewriting answers
- Running a mock interview

### 4.2 Source-Grounded

The app must distinguish between:

- Facts from user-provided sources
- Facts from web research, when available
- Resume or candidate profile facts
- Model inferences

If something is inferred, label it as an inference.

Important claims should carry evidence metadata:

```ts
type Evidence = {
  sourceId?: string;
  sourceType: "user_source" | "web" | "resume" | "inference";
  quote?: string;
  confidence: "high" | "medium" | "low";
};
```

### 4.3 Human-Written Feel

The report should sound like a strong interview coach and strategy consultant wrote it.

Avoid generic AI phrasing such as:

- It is important to note that
- In today's rapidly evolving landscape
- This underscores the importance of
- Leverage your experience
- Demonstrate your ability to
- Multifaceted role
- Robust understanding
- Delve into
- Seamlessly

Preferred style:

```text
This role needs someone who can turn messy client workflows into clear agent designs. Your best angle is that you have worked across strategy, execution, stakeholders, and AI-assisted building.
```

### 4.4 Skimmable, Not Dense

Use:

- Short paragraphs
- Clear section headings
- Callout boxes
- Tables where they help comparison
- Sidebar navigation
- Source chips
- Practical "say this" and "avoid this" guidance

Avoid:

- Giant markdown walls
- Dense dashboard UI
- Generic advice
- Decorative images

## 5. Target User

The primary user is a professional preparing for interviews in strategy, product, growth, operations, consulting, business development, AI, customer strategy, or general management.

Example:

Kevin is interviewing for an Agent Strategist role at Sierra. He uploads his resume, the job description, recruiter notes, and useful sources about Sierra. The app generates a prep module explaining the company, role, likely questions, candidate positioning, terminology, risks, and smart questions to ask.

## 6. Non-Goals

Do not build these in the MVP:

- Chat interface
- Fully autonomous open-ended agent
- Browser automation requiring logins
- LinkedIn scraping behind login
- Glassdoor scraping behind login
- Email or calendar integrations
- Payments or subscriptions
- Native mobile app
- Real-time collaboration
- Audio or video mock interviews
- Fine-tuning
- Local LLM hosting
- Multi-user teams or workspaces

## 7. Core Screens

### 7.1 Input Screen

The input screen lets the candidate provide all useful context before starting the workflow.

Suggested sections:

1. Role details
2. Candidate profile
3. Interview context
4. Useful sources
5. Output preferences

Required fields:

- Company name
- Role title
- Job description text
- Resume or candidate profile text
- Interview stage

Optional fields:

- Job URL
- Company website
- Target country or market
- Role location
- Work model
- LinkedIn URL
- Candidate notes
- Story bank or achievements
- Experience to highlight
- Experience to avoid overemphasizing
- Interviewer name
- Interviewer title
- Interviewer LinkedIn URL
- Recruiter notes
- Previous interview notes
- Known case prompt or assignment brief
- Useful source URLs, pasted notes, PDFs, DOCX, TXT, or Markdown files

For the first implementation, pasted text sources are sufficient. File upload and URL fetching can follow after the report workflow is working.

### 7.2 Agent Progress Screen

The progress screen shows that the app is working through a structured process without exposing unnecessary technical detail.

MVP task cards:

1. Source Ingestion
2. Source Extraction
3. Role Decoder
4. Candidate Match
5. Candidate Pitch
6. Interview Questions
7. Final Report Assembly
8. Report Quality Check

Later task cards:

1. Company Research
2. Competitive Position
3. Terminology
4. Image Selection

Each card should show:

- Status
- Short description
- Number of sources processed, where relevant
- Completion timestamp, if completed
- Error message, if failed

Allowed statuses:

- Queued
- Running
- Completed
- Failed
- Skipped

The workflow should tolerate partial failure. Do not fail the whole run unless final report assembly cannot proceed.

### 7.3 Report Reading Screen

The report screen is the most important product surface. It should present the final prep pack as a readable learning module.

Desktop layout:

- Left sidebar table of contents
- Main reading column
- Optional right rail for source count, export, and copy controls

Mobile layout:

- Collapsible table of contents
- Single-column reading view

Required report UX:

- Sidebar table of contents
- Smooth scroll to section
- Active section highlighting
- Source count indicator
- Source chips
- Copy section button
- Export markdown button
- Clear uncertainty labels

Styling direction:

- Light background
- Comfortable line height
- Max-width reading column
- Generous whitespace
- Soft dividers
- Muted source chips
- Callout boxes for coaching points
- Optional editorial-style headings

Avoid:

- Chat bubbles
- Dense dashboards
- Overuse of gradients
- Robotic "AI generated report" feel

## 8. Final Report Structure

The final report should include:

1. Candidate Thesis
2. Company Snapshot
3. Role Interpretation
4. Source Library Insights
5. Candidate Fit and Pitch
6. Likely Interview Questions
7. Questions to Ask Them
8. 30/60/90-Day Plan
9. Risks, Gaps, and Red Flags
10. Final Cheat Sheet

Optional enhancement sections:

- Competitive Position
- Industry and Role Terminology
- Image-backed visual explainers

### 8.1 Candidate Thesis

Purpose: give the candidate a clear angle for the interview.

Include:

- One-sentence positioning
- 30-second pitch
- 60-second pitch
- "Tell me about yourself" answer
- "Why this company?"
- "Why this role?"
- "Why you?"
- What to emphasize
- What to avoid

### 8.2 Company Snapshot

Purpose: explain what the company does and what matters about it.

Include only supported or clearly inferred material:

- What the company does
- Products or services
- Customer segments
- Business model, if known
- Recent moves, if sourced
- Leadership commentary, if sourced
- Unknowns or low-confidence areas

### 8.3 Role Interpretation

Purpose: decode what the role likely involves beyond the literal job description.

Include:

- Plain-English role summary
- Core responsibilities
- Hidden expectations
- Success metrics
- Likely stakeholders
- Day in the life
- First 30/60/90 days
- Explicit skills
- Implied skills

### 8.4 Source Library Insights

Purpose: translate user-provided sources into interview action.

Include:

- Key facts
- Useful phrases or quotes
- Strategic themes
- Role relevance
- Candidate pitch relevance
- Questions to ask
- Risks or red flags

Bad:

```text
The company is expanding into enterprise customers.
```

Good:

```text
The company is expanding into enterprise customers. In the interview, connect this to your experience managing complex stakeholders, ambiguous requirements, and cross-functional execution.
```

### 8.5 Candidate Fit and Pitch

Purpose: map the candidate's experience to the role.

Include:

- Strongest match points
- Resume evidence
- Best experience to emphasize
- Weak spots or gaps
- How to address gaps
- STAR stories to prepare
- Experience to downplay

### 8.6 Likely Interview Questions

Purpose: predict likely questions and help the candidate answer them.

Each question should include:

- Category
- Why they might ask
- What they are testing
- Recommended answer structure
- Best candidate example to use
- Red flags to avoid

Question categories:

- Motivational
- Behavioral
- Technical or domain
- Case
- Company-specific
- Resume challenge
- Role-specific

### 8.7 Questions to Ask Them

Purpose: give the candidate strong questions to ask the interviewer.

Organize by interviewer type:

- Recruiter
- Hiring manager
- Peer
- Executive
- Founder

Question categories:

- Role scope
- Success metrics
- Team and operating model
- Company strategy
- Competitive position
- Progression
- Culture
- Work model
- Hiring process

### 8.8 30/60/90-Day Plan

Purpose: help the candidate sound commercially and operationally thoughtful.

Make the plan specific to the role.

First 30 days:

- Learn the business
- Understand stakeholders
- Review current metrics and processes
- Identify immediate gaps

First 60 days:

- Diagnose opportunities
- Build a priority list
- Align with manager and team
- Start quick wins

First 90 days:

- Own one or more meaningful workstreams
- Deliver measurable progress
- Build an operating cadence

### 8.9 Risks, Gaps, and Red Flags

Purpose: help the candidate prepare for objections and assess the opportunity.

Candidate risks:

- Experience gaps
- Domain gaps
- Seniority mismatch
- Technical depth concerns

Company or role risks:

- Ambiguous scope
- Unclear reporting line
- Unrealistic expectations
- Culture concerns
- Market headwinds
- Compensation uncertainty

Each risk should include:

- Why it matters
- How to address it
- Whether to ask about it directly

### 8.10 Final Cheat Sheet

Purpose: a one-page summary the candidate can read 15 minutes before the interview.

Include:

- Candidate thesis
- Three strongest proof points
- Three company facts to remember
- Three likely questions
- Three questions to ask them
- Three terms or metrics to know, if relevant
- Main objection to handle
- Final reminder

## 9. Structured Report Data

The backend should produce normalized report JSON. The frontend should render that JSON. The backend should not produce page-specific HTML.

Markdown is allowed inside controlled content fields, but the report should not be one giant markdown string.

```ts
type Report = {
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

type ReportSection = {
  id: string;
  title: string;
  summary: string;
  subsections: ReportSubsection[];
  callouts: ReportCallout[];
  tables: ReportTable[];
  images?: ReportImage[];
  evidence?: Evidence[];
};

type ReportSubsection = {
  id: string;
  title: string;
  contentMarkdown: string;
  evidence?: Evidence[];
};

type ReportCallout = {
  type: "say_this" | "avoid_this" | "remember" | "risk" | "source_note" | "example";
  title: string;
  content: string;
  evidence?: Evidence[];
};

type ReportTable = {
  title: string;
  columns: string[];
  rows: string[][];
  evidence?: Evidence[];
};

type ReportImage = {
  url: string;
  alt: string;
  source: string;
  license: string;
  attribution: string;
};
```

## 10. Agent Workflow

### 10.1 MVP Workflow

Build the first implementation around these agents:

1. Source Ingestion
2. Source Extraction
3. Role Decoder
4. Candidate Match
5. Candidate Pitch
6. Interview Questions
7. Final Report Assembly
8. Report Quality Check

### 10.2 Enhancement Workflow

Add these after the MVP is reliable:

1. Company Research
2. Competitive Position
3. Terminology
4. Image Selection

### 10.3 Base Agent Rules

All agents should follow these rules:

- Be specific to the company, role, job description, candidate resume, and interview stage.
- Distinguish confirmed facts from inferences.
- Do not invent company facts, financials, competitors, dates, or claims.
- If evidence is weak or unavailable, say so.
- Every useful finding should include an interview implication.
- Prioritize actionable interview preparation over generic explanation.
- Use clear, human language.
- Avoid obvious AI phrasing.
- Return valid JSON matching the requested schema.

### 10.4 Report Quality Check

Before saving the final report, validate that:

- All required sections exist.
- Major claims have evidence or are labeled as inferences.
- The candidate's resume is used in candidate-fit sections.
- The job description is used in role interpretation.
- Each major section includes interview implications.
- Generic advice is minimized.
- Banned AI phrases are absent.
- The final report is skimmable.

## 11. Source Ingestion

MVP-supported inputs:

- Pasted text
- Pasted notes
- Job description text
- Resume text

Post-MVP-supported inputs:

- URLs
- PDFs
- DOCX
- TXT
- Markdown

URL fetching should use a `fetchUrl(url)` abstraction that:

- Fetches readable page text where possible
- Stores title, URL, raw text, and clean text
- Fails gracefully if blocked
- Stores error messages

File parsing should support:

- PDF to text
- DOCX to text
- TXT and Markdown passthrough

OCR is out of scope for MVP.

## 12. LLM Router

Implement a provider abstraction:

```ts
type LLMRequest = {
  modelRole: "research" | "synthesis" | "final";
  systemPrompt: string;
  userPrompt: string;
  responseSchema?: object;
};

type LLMResponse = {
  text: string;
  json?: unknown;
  inputTokens?: number;
  outputTokens?: number;
  provider: string;
  model: string;
};
```

Configure models through environment variables:

```bash
OPENAI_API_KEY=
OPENROUTER_API_KEY=
RESEARCH_MODEL=
SYNTHESIS_MODEL=
FINAL_MODEL=
```

Suggested routing:

- Research agents use a cheaper model.
- Synthesis agents use a stronger model.
- Final report assembly uses the strongest configured model.

## 13. Structured Output Handling

All agents should return JSON where possible.

If JSON parsing fails:

1. Retry once with a JSON repair prompt.
2. If still failing, store raw text.
3. Mark the task as failed or partially completed.
4. Allow retry from the UI.

## 14. Token Management

Do not pass all raw source text to every agent.

Rules:

- Always include job description.
- Always include resume.
- Use source extraction summaries after extraction.
- Use company research output instead of raw web pages.
- Include relevant source chunks only where needed.

Recommended caps:

- Max resume text: 12,000 tokens
- Max job description: 8,000 tokens
- Max source text per extraction call: 20,000 tokens
- Max total source extraction batch: 60,000 tokens
- Max final synthesis input: 80,000 tokens

If a source exceeds the cap, chunk and process it in batches.

## 15. Cost Tracking

Track estimated usage for every LLM call:

- Provider
- Model
- Input tokens
- Output tokens
- Cached input tokens
- Estimated cost
- Latency
- Agent task

Show per-run totals in a debug or admin section.

Cost estimates should be configurable, not hardcoded as facts.

## 16. Privacy and Data Handling

The MVP should include:

- Delete prep run
- Delete uploaded or pasted source
- Delete candidate profile, if profiles are implemented
- Avoid logging raw resume content
- Avoid sending data to unnecessary services
- Store secrets only in environment variables

Suggested UI privacy note:

```text
Your resume, job details, and uploaded sources are used to generate your interview prep pack. You can delete a prep run and its associated sources at any time.
```

## 17. Error Handling

The app should tolerate partial failure:

- If company web research fails, continue with user-provided sources.
- If one URL cannot be fetched, log the failure and continue.
- If one source cannot be parsed, show the failed source and continue.
- If one agent fails, show failed status and allow retry.

Do not fail the entire run unless final report assembly cannot proceed.

## 18. Recommended Tech Stack

Frontend:

- Next.js
- React
- Tailwind CSS
- shadcn/ui
- Markdown renderer

Backend:

- Next.js API routes for the first MVP
- A separate FastAPI backend only if workflow complexity requires it later

Data:

- Local development storage first
- Postgres when persistence and deployment matter
- pgvector optional later

File storage:

- Local filesystem in development
- Cloudflare R2, Supabase Storage, or S3-compatible storage in production

Queue and workflow:

- Synchronous or simple background execution for the earliest prototype
- BullMQ, Inngest, or Trigger.dev when workflow retries and production reliability matter

Dependency rule:

- Project dependencies should be installed locally so the entire project can be deleted cleanly if needed.

## 19. Suggested API Routes

```http
POST /api/job-runs
GET /api/job-runs
GET /api/job-runs/:id
POST /api/job-runs/:id/start
POST /api/job-runs/:id/cancel
GET /api/job-runs/:id/status
GET /api/job-runs/:id/report
DELETE /api/job-runs/:id

POST /api/job-runs/:id/sources
GET /api/job-runs/:id/sources
DELETE /api/sources/:id

GET /api/job-runs/:id/agent-tasks
POST /api/job-runs/:id/agent-tasks/:taskId/retry

GET /api/job-runs/:id/model-usage
```

## 20. Suggested Components

Input screen:

- `NewRunForm`
- `RoleDetailsForm`
- `CandidateProfileForm`
- `InterviewContextForm`
- `SourceUploader`
- `OutputPreferencesForm`

Progress screen:

- `RunProgress`
- `AgentStatusCard`
- `SourceProcessingSummary`
- `RetryFailedTaskButton`

Report screen:

- `ReportLayout`
- `ReportSidebar`
- `ReportSection`
- `ReportSubsection`
- `ReportCallout`
- `ReportTable`
- `ReportImage`
- `SourceChip`
- `CheatSheetCard`
- `CopySectionButton`
- `ExportMarkdownButton`

## 21. Build Order

### Phase 1: App Shell and Mock Report Renderer

Build:

- Input screen skeleton
- Progress screen skeleton
- Report reading screen
- Static sample report JSON
- Sidebar navigation
- Section rendering
- Callouts
- Tables
- Copy section button
- Markdown export

### Phase 2: Input Form and Local Run Storage

Build:

- New run form
- Local persistence for runs
- Resume text input
- Job description text input
- Interview stage input
- Pasted source input
- Delete run

### Phase 3: Report Schema and Validation

Build:

- Shared TypeScript report schema
- Runtime validation
- Sample fixtures
- Quality checks for required sections

### Phase 4: LLM Router

Build:

- Provider abstraction
- Model role routing
- JSON output parsing
- JSON repair retry
- Usage logging

### Phase 5: Minimal Agent Workflow

Build:

1. Source Extraction Agent
2. Role Decoder Agent
3. Candidate Match Agent
4. Candidate Pitch Agent
5. Interview Question Agent
6. Final Report Assembly Agent
7. Report Quality Check

### Phase 6: Workflow Progress

Build:

- Agent task creation
- Status updates
- Progress screen updates
- Retry failed task
- Partial failure behavior

### Phase 7: Source Expansion

Build:

- File upload
- PDF parsing
- DOCX parsing
- TXT and Markdown passthrough
- URL fetching

### Phase 8: Research Expansion

Build:

- Web search abstraction
- Company Research Agent
- Competitive Position Agent
- Terminology Agent

### Phase 9: Polish

Build:

- Better report styling
- Source list
- Source count
- Cost display
- Image attribution, if images are implemented
- Production deployment hardening

## 22. MVP Acceptance Criteria

The MVP is complete when the user can:

1. Create a new prep run.
2. Add company, role, job description, resume, interview stage, and useful source text.
3. Start the prep workflow.
4. See a loading screen with agent progress.
5. Receive a structured report.
6. Navigate the report using a sidebar.
7. Read sections that are specific and not overly text dense.
8. See a candidate thesis and pitch.
9. See company or source-derived context.
10. See role interpretation.
11. See source-derived insights.
12. See candidate fit and gaps.
13. See likely questions.
14. See questions to ask.
15. See risks, gaps, and red flags.
16. See a final cheat sheet.
17. Copy or export the report as Markdown.
18. Delete a prep run.

## 23. Definition of Done

The MVP is done when it can take this minimum input:

```text
Company: Sierra
Role: Agent Strategist
Job description: pasted text
Resume: pasted text
Interview stage: Hiring manager interview
Useful sources: pasted notes or source excerpts
```

And produce a source-aware, skimmable, immediately useful report containing:

- Candidate thesis
- Company snapshot or source-grounded company context
- Role interpretation
- Source-derived insights
- Candidate fit and pitch
- Likely interview questions
- Questions to ask them
- 30/60/90-day plan
- Risks, gaps, and red flags
- Final cheat sheet

