# Interview Prep Agent

Interview Prep Agent is a workflow web app for generating source-grounded interview preparation reports.

The app is intentionally not a chat app in the MVP. A candidate enters the company, role, job description, resume or profile, interview stage, and useful source material. The app runs a structured AI workflow and produces a readable interview prep pack with practical guidance on what to know, say, ask, and rehearse.

## Product Shape

The MVP has three main screens:

1. Input screen
2. Agent progress screen
3. Report reading screen

The final report should feel like a curated learning module: sidebar table of contents, short sections, callouts, tables, source chips, copy controls, and markdown export.

## Core MVP Scope

The first version should prove the core loop:

```text
Candidate and role inputs -> structured agent workflow -> report JSON -> readable report UI
```

Required MVP inputs:

- Company name
- Role title
- Job description text
- Resume or candidate profile text
- Interview stage
- Optional pasted source material

Deferred until after the core loop works:

- Live web research
- Competitor research
- Image selection
- Compensation research
- URL fetching
- PDF and DOCX parsing
- Chat, quiz, rewrite, or mock interview modes

## Source-Grounded Report Rules

The report should distinguish between:

- User-provided source facts
- Resume facts
- Web research facts, when web research exists
- Model inferences

Important claims should include confidence and evidence metadata. Inferences should be labeled as inferences.

## Report Sections

The generated report should include:

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

Optional later sections:

- Competitive Position
- Industry and Role Terminology
- Image-backed visual explainers

## Development Plan

### Stage 1: App Shell and Mock Report Renderer

Build the three-screen skeleton using static sample JSON:

- Input screen
- Progress screen
- Report reading screen
- Sidebar navigation
- Active section highlighting
- Report sections
- Callouts
- Tables
- Copy section button
- Markdown export

This stage proves the most important product surface before backend complexity is added.

### Stage 2: Input Form and Local Run Storage

Add real run creation and local persistence:

- New run form
- Resume text input
- Job description text input
- Interview stage input
- Pasted source input
- Run detail view
- Delete run

### Stage 3: Shared Report Schema

Define the structured report contract:

- TypeScript report types
- Runtime validation
- Sample fixtures
- Required section validation
- Evidence and confidence metadata

The backend should produce normalized report JSON, not one giant markdown string.

### Stage 4: LLM Router

Add model-provider infrastructure:

- Provider abstraction
- Model role routing for research, synthesis, and final output
- JSON response parsing
- One JSON repair retry
- Token and cost logging

Environment variables:

```bash
OPENAI_API_KEY=
OPENROUTER_API_KEY=
RESEARCH_MODEL=
SYNTHESIS_MODEL=
FINAL_MODEL=
```

### Stage 5: Minimal Agent Workflow

Implement the first useful agent chain:

1. Source Extraction Agent
2. Role Decoder Agent
3. Candidate Match Agent
4. Candidate Pitch Agent
5. Interview Question Agent
6. Final Report Assembly Agent
7. Report Quality Check

The quality check should verify that required sections exist, important claims have evidence or inference labels, candidate-specific evidence appears in the fit sections, and generic advice is minimized.

### Stage 6: Workflow Progress and Retries

Connect the backend workflow to the progress UI:

- Agent task records
- Queued, running, completed, failed, and skipped states
- Partial failure handling
- Retry failed task
- Continue to report when enough work completed

### Stage 7: Source Expansion

Add richer source ingestion:

- File upload
- PDF parsing
- DOCX parsing
- TXT and Markdown passthrough
- URL fetching
- Low-confidence handling for poor extraction

### Stage 8: Research Expansion

Add supplemental research:

- Web search abstraction
- Company Research Agent
- Competitive Position Agent
- Terminology Agent

User-provided sources should remain primary. Web research should improve the report, not become a hard dependency.

### Stage 9: Polish and Production Readiness

Add:

- Better report styling
- Source list and source count
- Cost display
- Privacy copy
- Delete source
- Export improvements
- Deployment hardening
- Optional image selection with open-license attribution

## Recommended Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible component structure
- lucide-react icons
- Zod for validation
- Markdown renderer
- Next.js API routes for the first backend
- SQLite runtime persistence with `better-sqlite3` at `./data/app.db`
- Prisma schema in `./prisma/schema.prisma` kept as a future migration reference
- Project-local storage under `./data`
- OpenRouter as the primary MVP LLM provider
- OpenAI-compatible provider abstraction for future flexibility

Project dependencies should be installed locally so the whole project can be deleted cleanly if needed.

## Local-First Development

The MVP should keep runtime state inside the project folder where practical:

- SQLite database: `./data/app.db`
- Uploaded files: `./data/uploads`
- Generated exports: `./data/exports`
- Local package dependencies: `./node_modules`

The repository ignores local runtime state so the app can be reset by deleting generated folders.

Runtime persistence currently uses `better-sqlite3` directly. Prisma is not required to run the local MVP; the Prisma schema is retained as the reference contract for a later hosted Postgres migration.

## MVP Access Control

The MVP does not need real user accounts. Use a shared password gate:

```bash
APP_ACCESS_PASSWORD=
```

After successful password entry, the app should store a signed HTTP-only cookie. Later, this can be replaced with real user auth through Auth.js, Clerk, Supabase Auth, or better-auth.

## LLM Defaults

OpenRouter is the default provider during MVP development. The app should use environment-configured model roles:

```bash
OPENROUTER_API_KEY=
RESEARCH_MODEL=
SYNTHESIS_MODEL=
FINAL_MODEL=
```

Use this OpenRouter model progression:

1. Gemma 4 for earliest MVP testing.
2. DeepSeek V4 Flash when the workflow needs stronger cheap synthesis.
3. GLM 5.2 as the production candidate.

The exact values should be the current OpenRouter model IDs available in the account. The router should remain OpenAI-compatible so the project can support other providers later.

## Cost Guardrails

Model calls are gated by these limits:

```bash
MAX_RUN_COST_USD=1.00
MAX_DAILY_COST_USD=5.00
MAX_INPUT_TOKENS_PER_RUN=60000
MAX_OUTPUT_TOKENS_PER_RUN=12000
MAX_OUTPUT_TOKENS_PER_AGENT=2500
MAX_AGENT_RETRIES=1
MAX_RUN_DURATION_SECONDS=300
MAX_SOURCES_PER_RUN=8
MAX_URLS_PER_RUN=8
MAX_FILES_PER_RUN=5
MAX_FILE_SIZE_MB=8
MAX_SOURCE_CHUNKS_PER_RUN=80
MAX_WEB_SEARCHES_PER_RUN=10
```

The workflow should estimate cost before model calls, stop when a run reaches its cap, block new runs when the daily cap is reached, and log usage by agent task.

Agent responses should also have explicit completion caps so one verbose response cannot consume the whole budget:

```bash
SOURCE_EXTRACTION_MAX_OUTPUT_TOKENS=1800
COMPANY_RESEARCH_MAX_OUTPUT_TOKENS=1800
COMPETITIVE_POSITION_MAX_OUTPUT_TOKENS=1800
ROLE_DECODER_MAX_OUTPUT_TOKENS=1400
TERMINOLOGY_MAX_OUTPUT_TOKENS=1200
CANDIDATE_MATCH_MAX_OUTPUT_TOKENS=1800
CANDIDATE_PITCH_MAX_OUTPUT_TOKENS=1600
INTERVIEW_QUESTIONS_MAX_OUTPUT_TOKENS=2200
IMAGE_SELECTION_MAX_OUTPUT_TOKENS=800
FINAL_REPORT_MAX_OUTPUT_TOKENS=4500
CHEAT_SHEET_MAX_OUTPUT_TOKENS=1000
REPORT_QA_MAX_OUTPUT_TOKENS=900
```

When real LLM calls are added, these values should be passed to OpenRouter as `max_tokens`, validated after each response, and counted toward `MAX_OUTPUT_TOKENS_PER_RUN`.

The hardening baseline covers prompt-injection handling, SSRF protection primitives, secure upload validation, markdown sanitization, safe logging, model-usage tracking, and graceful budget-exceeded stops.

## Current Hardening Baseline

The local MVP now includes:

- Shared-password auth gate with HTTP-only session cookie.
- Request body limit checks for form submissions.
- Rate limits for run creation and retry/start actions.
- Guarded URL validation that blocks private, loopback, link-local, and unsafe protocols.
- Upload candidate validation for file extension, MIME type, count, and size.
- Markdown link sanitization for rendered report content.
- Budget preflight checks and budget-exceeded workflow failure state.
- Per-agent usage logging with model, token counts, status, and estimated cost.
- Admin usage view plus CSV export.
- Structured server logging with secret redaction.
- Friendly error page for invalid inputs, budget failures, rate limits, and workflow failures.
- Automated tests covering auth gate, run creation, workflow completion, budget cap failure, unsafe URL blocking, and markdown link sanitization.

Old demo routes have been removed:

- `/runs/demo/progress`
- `/runs/demo/report`

## Low-Cost Hosting Path

A low-cost hosted MVP can use:

- Vercel for the Next.js app
- Neon Postgres or Supabase Postgres for hosted persistence
- Cloudflare R2 or Supabase Storage for uploaded files
- OpenRouter for model calls
- Vercel environment variables for secrets

If workflow runs exceed serverless limits, add Inngest or Trigger.dev before building a custom worker system.

## Remaining Work by Priority

### Priority 0: Immediate Validation Before Sharing

These should be done before treating the MVP as ready for real interview prep use.

1. Test the OpenRouter path with a real `OPENROUTER_API_KEY`.
2. Replace placeholder model IDs with the exact OpenRouter model IDs for Gemma 4, DeepSeek V4 Flash, and GLM 5.2.
3. Run several real prep runs and inspect whether each agent returns usable JSON.
4. Tighten prompts where reports are generic, too long, or insufficiently source-grounded.
5. Confirm the hardcoded pricing assumptions match the selected OpenRouter models.
6. Update the README and PRD if the model IDs, budget defaults, or storage approach change during real-model testing.

### Priority 1: MVP Quality Pass

These improve the core prep output and make the app easier to trust in day-to-day use.

1. Replace the current local deterministic agent outputs with richer prompt templates for each real agent.
2. Add stronger final report QA checks for missing evidence, generic prose, unsupported claims, and overlong sections.
3. Improve evidence/source chips so users can see which source supports each claim.
4. Add a source inspection panel that shows source title, type, confidence, and extracted insights.
5. Add regenerate-failed-task behavior rather than regenerating the whole run.
6. Improve failed, partial, and budget-exceeded UI states on the progress and report screens.
7. Improve mobile table of contents behavior.
8. Improve markdown export formatting and include source/evidence summaries.
9. Add saved-run search, filters, and sorting.
10. Expand automated tests for report loading, admin usage, retry limits, upload validation, and CSV export.

### Priority 2: Source Expansion

These extend the MVP beyond pasted text.

1. Add TXT and Markdown file passthrough.
2. Add PDF parsing.
3. Add DOCX parsing.
4. Add document triage for long files before extraction.
5. Add source chunking and relevance selection.
6. Enforce extracted text caps per source.
7. Add secure file upload endpoints with MIME, extension, size, and decompressed-size checks.
8. Add URL ingestion with timeout, redirect limits, DNS/IP revalidation, SSRF protection, and response-size caps.
9. Add source list UI.
10. Add delete-source behavior.
11. Add low-confidence source markers.

### Priority 3: Research Expansion

These are valuable but not required for the local MVP.

1. Add web search abstraction.
2. Add Company Research Agent.
3. Add Competitive Position Agent.
4. Add Terminology Agent.
5. Add Image Selection Agent.
6. Add public/open-license image metadata and attribution.
7. Add optional compensation research with strict search/fetch caps.

### Priority 4: Production Readiness

These are needed before broader hosted use.

1. Deploy the Next.js app to Vercel or another low-cost host.
2. Move persistence from local SQLite to hosted Postgres through Neon or Supabase.
3. Move uploaded files to Cloudflare R2 or Supabase Storage.
4. Replace shared password access with real auth.
5. Add real users and scope every query by `user_id`.
6. Add per-user daily run limits and spend caps.
7. Add queue/background execution with Inngest or Trigger.dev if runs exceed serverless limits.
8. Add production admin dashboard filters by user, job, model, provider, date range, and status.
9. Add monitoring for failed runs, budget-exceeded runs, model errors, and latency.

### Priority 5: Migration Cleanup

These clean up the persistence path once the hosted target is chosen.

1. Decide whether Prisma remains the migration tool for hosted Postgres.
2. If Prisma remains, restore Prisma scripts and add migrations.
3. If Prisma is dropped, remove the schema reference and document the replacement migration approach.
4. Add a one-way migration plan from `data/app.db` to the hosted database.

## Run Locally

### Windows PowerShell

Install dependencies with project-local cache folders:

```powershell
$env:npm_config_cache="$PWD\.npm-cache"
$env:APPDATA="$PWD\.appdata"
$env:LOCALAPPDATA="$PWD\.localappdata"
npm.cmd install
```

Create a local environment file:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` and set at least:

```bash
APP_ACCESS_PASSWORD=your-local-password
OPENROUTER_API_KEY=your-openrouter-key
```

Run the app:

```powershell
node.exe node_modules/next/dist/bin/next dev -p 3000
```

Open:

```text
http://localhost:3000
```

Useful checks:

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

### macOS

Install dependencies with a project-local npm cache:

```bash
export npm_config_cache="$PWD/.npm-cache"
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set at least:

```bash
APP_ACCESS_PASSWORD=your-local-password
OPENROUTER_API_KEY=your-openrouter-key
```

Run the app:

```bash
npm run dev -- -p 3000
```

Open:

```text
http://localhost:3000
```

Useful checks:

```bash
npm run typecheck
npm run test
npm run build
```

## Documentation

The cleaned product requirements live in [PRD.md](./PRD.md).
