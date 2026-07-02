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
- SQLite with Prisma for MVP local persistence
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

Real model calls should not be enabled until these limits are enforced:

```bash
MAX_RUN_COST_USD=1.00
MAX_DAILY_COST_USD=5.00
MAX_INPUT_TOKENS_PER_RUN=60000
MAX_OUTPUT_TOKENS_PER_RUN=12000
```

The workflow should estimate cost before model calls, stop when a run reaches its cap, block new runs when the daily cap is reached, and log usage by agent task.

## Low-Cost Hosting Path

A low-cost hosted MVP can use:

- Vercel for the Next.js app
- Neon Postgres or Supabase Postgres for hosted persistence
- Cloudflare R2 or Supabase Storage for uploaded files
- OpenRouter for model calls
- Vercel environment variables for secrets

If workflow runs exceed serverless limits, add Inngest or Trigger.dev before building a custom worker system.

## Run Locally

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
npm.cmd run build
```

## Documentation

The cleaned product requirements live in [PRD.md](./PRD.md).
