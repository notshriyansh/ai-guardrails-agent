import { db } from "../db/db";

export type PendingExecution = {
  approvalId: string;
  selectedTool: string;
  toolArgs: Record<string, unknown>;
  userMessage: string;
};

export function addPendingExecution(
  execution: PendingExecution,
) {
  db.prepare(`
    INSERT OR REPLACE INTO pending_executions (
      approval_id,
      selected_tool,
      tool_args_json,
      user_message,
      created_at
    )
    VALUES (
      @approvalId,
      @selectedTool,
      @toolArgsJson,
      @userMessage,
      @createdAt
    )
  `).run({
    approvalId: execution.approvalId,
    selectedTool: execution.selectedTool,
    toolArgsJson: JSON.stringify(
      execution.toolArgs,
    ),
    userMessage: execution.userMessage,
    createdAt: new Date().toISOString(),
  });
}

export function getPendingExecution(
  approvalId: string,
): PendingExecution | undefined {
  const row = db
    .prepare(`
      SELECT
        approval_id,
        selected_tool,
        tool_args_json,
        user_message,
        created_at
      FROM pending_executions
      WHERE approval_id = ?
    `)
    .get(approvalId) as
    | {
        approval_id: string;
        selected_tool: string;
        tool_args_json: string;
        user_message: string;
        created_at: string;
      }
    | undefined;

  if (!row) {
    return undefined;
  }

  return {
    approvalId: row.approval_id,
    selectedTool: row.selected_tool,
    toolArgs: JSON.parse(
      row.tool_args_json,
    ) as Record<string, unknown>,
    userMessage: row.user_message,
  };
}

export function removePendingExecution(
  approvalId: string,
) {
  db.prepare(`
    DELETE FROM pending_executions
    WHERE approval_id = ?
  `).run(approvalId);
}