import { db } from "./db";

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      tool_name TEXT NOT NULL,
      arguments_json TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS pending_executions (
      approval_id TEXT PRIMARY KEY,
      selected_tool TEXT NOT NULL,
      tool_args_json TEXT NOT NULL,
      user_message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (approval_id)
        REFERENCES approvals(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS conversation_logs (
      id TEXT PRIMARY KEY,
      user_message TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tool_logs (
      id TEXT PRIMARY KEY,
      tool_name TEXT NOT NULL,
      arguments_json TEXT NOT NULL,
      result_json TEXT,
      status TEXT NOT NULL DEFAULT 'success',
      approval_id TEXT,
      duration_ms INTEGER,
      error TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS policy_logs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      reason TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_approvals_status
      ON approvals(status);

    CREATE INDEX IF NOT EXISTS idx_tool_logs_timestamp
      ON tool_logs(timestamp);

    CREATE INDEX IF NOT EXISTS idx_policy_logs_timestamp
      ON policy_logs(timestamp);

    CREATE INDEX IF NOT EXISTS idx_conversation_logs_timestamp
      ON conversation_logs(timestamp);
  `);

  migrateApprovalsTable();
  migrateToolLogsTable();

  console.log("Database initialized");
}

function migrateApprovalsTable() {
  const columns = db
    .prepare(`PRAGMA table_info(approvals)`)
    .all() as Array<{ name: string }>;

  const columnNames = new Set(
    columns.map((column) => column.name),
  );

  if (!columnNames.has("status")) {
    db.exec(`
      ALTER TABLE approvals
      ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
    `);
  }

  if (!columnNames.has("resolved_at")) {
    db.exec(`
      ALTER TABLE approvals
      ADD COLUMN resolved_at TEXT
    `);
  }
}

function migrateToolLogsTable() {
  const columns = db
    .prepare(`PRAGMA table_info(tool_logs)`)
    .all() as Array<{ name: string }>;

  const columnNames = new Set(
    columns.map((column) => column.name),
  );

  if (!columnNames.has("result_json")) {
    db.exec(`
      ALTER TABLE tool_logs
      ADD COLUMN result_json TEXT
    `);
  }

  if (!columnNames.has("status")) {
    db.exec(`
      ALTER TABLE tool_logs
      ADD COLUMN status TEXT NOT NULL DEFAULT 'success'
    `);
  }

  if (!columnNames.has("approval_id")) {
    db.exec(`
      ALTER TABLE tool_logs
      ADD COLUMN approval_id TEXT
    `);
  }

  if (!columnNames.has("duration_ms")) {
    db.exec(`
      ALTER TABLE tool_logs
      ADD COLUMN duration_ms INTEGER
    `);
  }

  if (!columnNames.has("error")) {
    db.exec(`
      ALTER TABLE tool_logs
      ADD COLUMN error TEXT
    `);
  }
}