import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JobRunRecord = {
  id: string;
  userId: string;
  companyName: string;
  roleTitle: string;
  jobDescription: string;
  resumeText: string;
  interviewStage: string;
  recruiterNotes: string | null;
  status: string;
  statusReason: string | null;
  idempotencyKey: string | null;
  sourceCount: number;
  estimatedCostUsd: number;
  inputTokens: number;
  outputTokens: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SourceRecord = {
  id: string;
  jobRunId: string;
  userId: string;
  title: string;
  sourceType: string;
  contentText: string;
  tokenCount: number;
  confidence: "high" | "medium" | "low";
  createdAt: string;
};

export type AgentTaskRecord = {
  id: string;
  jobRunId: string;
  userId: string;
  agent: string;
  status: string;
  description: string;
  resultJson?: unknown;
  rawOutput?: string | null;
  errorMessage?: string | null;
  retriesUsed: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  model?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReportRecord = {
  id: string;
  jobRunId: string;
  userId: string;
  title: string;
  reportJson: unknown;
  markdown: string;
  createdAt: string;
  updatedAt: string;
};

export type ModelUsageRecord = {
  id: string;
  jobRunId: string;
  agentTaskId: string;
  userId: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  estimatedCostUsd: number;
  latencyMs: number;
  status: string;
  createdAt: string;
};

export const LOCAL_USER_EMAIL = "local@interview-prep-agent";
export const LOCAL_USER_ID = "local-user";

const dbPath = path.join(process.cwd(), "data", "app.db");
const now = () => new Date().toISOString();

const globalForSqlite = globalThis as unknown as { sqlite?: Database.Database };

function db() {
  if (!globalForSqlite.sqlite) {
    mkdirSync(path.dirname(dbPath), { recursive: true });
    globalForSqlite.sqlite = new Database(dbPath);
    globalForSqlite.sqlite.pragma("journal_mode = WAL");
    initialize(globalForSqlite.sqlite);
  }
  return globalForSqlite.sqlite;
}

function initialize(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      isAdmin INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS job_runs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      companyName TEXT NOT NULL,
      roleTitle TEXT NOT NULL,
      jobDescription TEXT NOT NULL,
      resumeText TEXT NOT NULL,
      interviewStage TEXT NOT NULL,
      recruiterNotes TEXT,
      status TEXT NOT NULL,
      statusReason TEXT,
      idempotencyKey TEXT,
      sourceCount INTEGER NOT NULL DEFAULT 0,
      estimatedCostUsd REAL NOT NULL DEFAULT 0,
      inputTokens INTEGER NOT NULL DEFAULT 0,
      outputTokens INTEGER NOT NULL DEFAULT 0,
      startedAt TEXT,
      completedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      jobRunId TEXT NOT NULL,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      sourceType TEXT NOT NULL,
      contentText TEXT NOT NULL,
      tokenCount INTEGER NOT NULL DEFAULT 0,
      confidence TEXT NOT NULL DEFAULT 'high',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agent_tasks (
      id TEXT PRIMARY KEY,
      jobRunId TEXT NOT NULL,
      userId TEXT NOT NULL,
      agent TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      resultJson TEXT,
      rawOutput TEXT,
      errorMessage TEXT,
      retriesUsed INTEGER NOT NULL DEFAULT 0,
      inputTokens INTEGER NOT NULL DEFAULT 0,
      outputTokens INTEGER NOT NULL DEFAULT 0,
      estimatedCost REAL NOT NULL DEFAULT 0,
      model TEXT,
      startedAt TEXT,
      completedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      jobRunId TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      reportJson TEXT NOT NULL,
      markdown TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS model_usage (
      id TEXT PRIMARY KEY,
      jobRunId TEXT NOT NULL,
      agentTaskId TEXT NOT NULL,
      userId TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      inputTokens INTEGER NOT NULL,
      outputTokens INTEGER NOT NULL,
      cachedInputTokens INTEGER NOT NULL DEFAULT 0,
      estimatedCostUsd REAL NOT NULL,
      latencyMs INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

export async function getLocalUser() {
  const database = db();
  const existing = database.prepare("SELECT * FROM users WHERE email = ?").get(LOCAL_USER_EMAIL) as UserRecord | undefined;
  if (existing) {
    database.prepare("UPDATE users SET name = ?, isAdmin = ?, updatedAt = ? WHERE id = ?").run("Local User", 1, now(), existing.id);
    return { ...existing, isAdmin: true };
  }

  const user: UserRecord = {
    id: LOCAL_USER_ID,
    email: LOCAL_USER_EMAIL,
    name: "Local User",
    isAdmin: true,
    createdAt: now(),
    updatedAt: now(),
  };
  database
    .prepare("INSERT INTO users (id, email, name, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)")
    .run(user.id, user.email, user.name, 1, user.createdAt, user.updatedAt);
  return user;
}

export async function listRuns(userId: string) {
  return (db()
    .prepare("SELECT * FROM job_runs WHERE userId = ? ORDER BY createdAt DESC")
    .all(userId) as JobRunRecord[]).map(enrichRun);
}

export async function getRun(userId: string, id: string) {
  const run = db().prepare("SELECT * FROM job_runs WHERE userId = ? AND id = ?").get(userId, id) as JobRunRecord | undefined;
  return run ? enrichRun(run) : null;
}

export async function createRun(input: {
  userId: string;
  companyName: string;
  roleTitle: string;
  jobDescription: string;
  resumeText: string;
  interviewStage: string;
  recruiterNotes?: string | null;
  source?: { title: string; contentText: string; tokenCount: number };
  inputTokens: number;
}) {
  const database = db();
  const run: JobRunRecord = {
    id: randomUUID(),
    userId: input.userId,
    companyName: input.companyName,
    roleTitle: input.roleTitle,
    jobDescription: input.jobDescription,
    resumeText: input.resumeText,
    interviewStage: input.interviewStage,
    recruiterNotes: input.recruiterNotes ?? null,
    status: "draft",
    statusReason: null,
    idempotencyKey: null,
    sourceCount: input.source ? 1 : 0,
    estimatedCostUsd: 0,
    inputTokens: input.inputTokens,
    outputTokens: 0,
    startedAt: null,
    completedAt: null,
    createdAt: now(),
    updatedAt: now(),
  };

  const transaction = database.transaction(() => {
    database
      .prepare(`INSERT INTO job_runs VALUES (@id, @userId, @companyName, @roleTitle, @jobDescription, @resumeText, @interviewStage, @recruiterNotes, @status, @statusReason, @idempotencyKey, @sourceCount, @estimatedCostUsd, @inputTokens, @outputTokens, @startedAt, @completedAt, @createdAt, @updatedAt)`)
      .run(run);

    if (input.source) {
      database
        .prepare(`INSERT INTO sources VALUES (@id, @jobRunId, @userId, @title, @sourceType, @contentText, @tokenCount, @confidence, @createdAt)`)
        .run({
          id: randomUUID(),
          jobRunId: run.id,
          userId: input.userId,
          title: input.source.title,
          sourceType: "pasted_text",
          contentText: input.source.contentText,
          tokenCount: input.source.tokenCount,
          confidence: "high",
          createdAt: now(),
        });
    }
  });
  transaction();
  return run;
}

export async function deleteRun(userId: string, id: string) {
  const database = db();
  database.transaction(() => {
    for (const table of ["model_usage", "reports", "agent_tasks", "sources", "job_runs"]) {
      database.prepare(`DELETE FROM ${table} WHERE userId = ? AND ${table === "job_runs" ? "id" : "jobRunId"} = ?`).run(userId, id);
    }
  })();
}

export async function replaceRunWorkflowData(userId: string, jobRunId: string) {
  const database = db();
  database.prepare("DELETE FROM model_usage WHERE userId = ? AND jobRunId = ?").run(userId, jobRunId);
  database.prepare("DELETE FROM agent_tasks WHERE userId = ? AND jobRunId = ?").run(userId, jobRunId);
}

export async function updateRun(userId: string, id: string, patch: Partial<JobRunRecord>) {
  const current = await getRun(userId, id);
  if (!current) return null;
  const next = { ...current, ...patch, updatedAt: now() };
  db().prepare(`
    UPDATE job_runs SET status=@status, statusReason=@statusReason, idempotencyKey=@idempotencyKey,
    estimatedCostUsd=@estimatedCostUsd, inputTokens=@inputTokens, outputTokens=@outputTokens,
    startedAt=@startedAt, completedAt=@completedAt, updatedAt=@updatedAt WHERE userId=@userId AND id=@id
  `).run(next);
  return next;
}

export async function createTask(input: Omit<AgentTaskRecord, "id" | "createdAt" | "updatedAt">) {
  const task: AgentTaskRecord = { ...input, id: randomUUID(), createdAt: now(), updatedAt: now() };
  db().prepare(`
    INSERT INTO agent_tasks VALUES (@id, @jobRunId, @userId, @agent, @status, @description, @resultJson, @rawOutput, @errorMessage, @retriesUsed, @inputTokens, @outputTokens, @estimatedCost, @model, @startedAt, @completedAt, @createdAt, @updatedAt)
  `).run({ ...task, resultJson: serialize(task.resultJson) });
  return task;
}

export async function updateTask(userId: string, id: string, patch: Partial<AgentTaskRecord>) {
  const current = db().prepare("SELECT * FROM agent_tasks WHERE userId = ? AND id = ?").get(userId, id) as
    | (Omit<AgentTaskRecord, "resultJson"> & { resultJson?: string | null })
    | undefined;
  if (!current) return null;
  const next = { ...current, resultJson: parse(current.resultJson), ...patch, updatedAt: now() };
  db().prepare(`
    UPDATE agent_tasks SET status=@status, resultJson=@resultJson, rawOutput=@rawOutput, errorMessage=@errorMessage,
    retriesUsed=@retriesUsed, inputTokens=@inputTokens, outputTokens=@outputTokens, estimatedCost=@estimatedCost,
    model=@model, startedAt=@startedAt, completedAt=@completedAt, updatedAt=@updatedAt WHERE userId=@userId AND id=@id
  `).run({ ...next, resultJson: serialize(next.resultJson) });
  return next;
}

export async function createUsage(input: Omit<ModelUsageRecord, "id" | "createdAt">) {
  const usage: ModelUsageRecord = { ...input, id: randomUUID(), createdAt: now() };
  db().prepare(`
    INSERT INTO model_usage VALUES (@id, @jobRunId, @agentTaskId, @userId, @provider, @model, @inputTokens, @outputTokens, @cachedInputTokens, @estimatedCostUsd, @latencyMs, @status, @createdAt)
  `).run(usage);
  return usage;
}

export async function upsertReport(input: Omit<ReportRecord, "id" | "createdAt" | "updatedAt">) {
  const existing = await getReport(input.userId, input.jobRunId);
  const record: ReportRecord = {
    ...input,
    id: existing?.id ?? randomUUID(),
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  };
  db().prepare(`
    INSERT INTO reports VALUES (@id, @jobRunId, @userId, @title, @reportJson, @markdown, @createdAt, @updatedAt)
    ON CONFLICT(jobRunId) DO UPDATE SET title=@title, reportJson=@reportJson, markdown=@markdown, updatedAt=@updatedAt
  `).run({ ...record, reportJson: JSON.stringify(record.reportJson) });
  return record;
}

export async function getReport(userId: string, jobRunId: string) {
  const report = db().prepare("SELECT * FROM reports WHERE userId = ? AND jobRunId = ?").get(userId, jobRunId) as Omit<ReportRecord, "reportJson"> & { reportJson: string } | undefined;
  return report ? { ...report, reportJson: parse(report.reportJson) } : null;
}

export async function adminUsage(userId: string) {
  const runs = await listRuns(userId);
  const usage = (db().prepare("SELECT * FROM model_usage WHERE userId = ? ORDER BY createdAt DESC").all(userId) as ModelUsageRecord[]).map((item) => ({
    ...item,
    jobRun: runs.find((run) => run.id === item.jobRunId),
    agentTask: getTasks(item.jobRunId, userId).find((task) => task.id === item.agentTaskId),
  }));
  return { runs, usage };
}

function enrichRun(run: JobRunRecord) {
  return {
    ...run,
    sources: getSources(run.id, run.userId),
    tasks: getTasks(run.id, run.userId),
    report: getReportSync(run.id, run.userId),
    modelUsage: getUsage(run.id, run.userId),
  };
}

function getSources(jobRunId: string, userId: string) {
  return db().prepare("SELECT * FROM sources WHERE userId = ? AND jobRunId = ? ORDER BY createdAt ASC").all(userId, jobRunId) as SourceRecord[];
}

function getTasks(jobRunId: string, userId: string) {
  return (db().prepare("SELECT * FROM agent_tasks WHERE userId = ? AND jobRunId = ? ORDER BY createdAt ASC").all(userId, jobRunId) as (Omit<AgentTaskRecord, "resultJson"> & { resultJson?: string | null })[]).map((task) => ({
    ...task,
    resultJson: parse(task.resultJson ?? undefined),
  }));
}

function getReportSync(jobRunId: string, userId: string) {
  const report = db().prepare("SELECT * FROM reports WHERE userId = ? AND jobRunId = ?").get(userId, jobRunId) as Omit<ReportRecord, "reportJson"> & { reportJson: string } | undefined;
  return report ? { ...report, reportJson: parse(report.reportJson) } : null;
}

function getUsage(jobRunId: string, userId: string) {
  return db().prepare("SELECT * FROM model_usage WHERE userId = ? AND jobRunId = ? ORDER BY createdAt ASC").all(userId, jobRunId) as ModelUsageRecord[];
}

function serialize(value: unknown) {
  return value === undefined ? null : JSON.stringify(value);
}

function parse(value: string | null | undefined): unknown {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
