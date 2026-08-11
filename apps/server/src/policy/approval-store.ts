import { db } from "../db/db";

export type PendingApproval = {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  reason: string;
  createdAt: string;
};

type ApprovalRow = {
  id: string;
  tool_name: string;
  arguments_json: string;
  reason: string;
  created_at: string;
  status: string;
  resolved_at: string | null;
};

export function createApproval(
  approval: PendingApproval,
) {
  const statement = db.prepare(`
    INSERT INTO approvals (
      id,
      tool_name,
      arguments_json,
      reason,
      created_at,
      status
    )
    VALUES (
      @id,
      @toolName,
      @argumentsJson,
      @reason,
      @createdAt,
      'pending'
    )
  `);

  statement.run({
    id: approval.id,
    toolName: approval.toolName,
    argumentsJson: JSON.stringify(
      approval.arguments,
    ),
    reason: approval.reason,
    createdAt: approval.createdAt,
  });
}

export function getApprovals(): PendingApproval[] {
  const rows = db
    .prepare(`
      SELECT
        id,
        tool_name,
        arguments_json,
        reason,
        created_at,
        status,
        resolved_at
      FROM approvals
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `)
    .all() as ApprovalRow[];

  return rows.map((row) => ({
    id: row.id,
    toolName: row.tool_name,
    arguments: JSON.parse(
      row.arguments_json,
    ) as Record<string, unknown>,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}

export function getApproval(
  approvalId: string,
) {
  const row = db
    .prepare(`
      SELECT
        id,
        tool_name,
        arguments_json,
        reason,
        created_at,
        status,
        resolved_at
      FROM approvals
      WHERE id = ?
    `)
    .get(approvalId) as
    | ApprovalRow
    | undefined;

  if (!row) {
    return undefined;
  }

  return {
    id: row.id,
    toolName: row.tool_name,
    arguments: JSON.parse(
      row.arguments_json,
    ) as Record<string, unknown>,
    reason: row.reason,
    createdAt: row.created_at,
    status: row.status,
    resolvedAt: row.resolved_at,
  };
}

export function resolveApproval(
  approvalId: string,
) {
  const resolvedAt =
    new Date().toISOString();

  const result = db
    .prepare(`
      UPDATE approvals
      SET
        status = 'approved',
        resolved_at = ?
      WHERE id = ?
        AND status = 'pending'
    `)
    .run(
      resolvedAt,
      approvalId,
    );

  return result.changes > 0;
}