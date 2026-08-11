import crypto from "crypto";
import {
  ConversationLog,
  PolicyLog,
  ToolExecutionLog,
} from "./log-types";
import { db } from "../db/db";

type ConversationRow = {
  id: string;
  user_message: string;
  timestamp: string;
};

type ToolLogRow = {
  id: string;
  tool_name: string;
  arguments_json: string;
  result_json: string | null;
  status: ToolExecutionLog["status"];
  approval_id: string | null;
  duration_ms: number | null;
  error: string | null;
  timestamp: string;
};

type PolicyLogRow = {
  id: string;
  type: PolicyLog["type"];
  tool_name: string;
  reason: string | null;
  timestamp: string;
};

export function addConversationLog(
  log: ConversationLog,
) {
  db.prepare(`
    INSERT INTO conversation_logs (
      id,
      user_message,
      timestamp
    )
    VALUES (
      @id,
      @userMessage,
      @timestamp
    )
  `).run({
    id: log.id,
    userMessage: log.userMessage,
    timestamp: log.timestamp,
  });
}

export function getConversationLogs(): ConversationLog[] {
  const rows = db
    .prepare(`
      SELECT
        id,
        user_message,
        timestamp
      FROM conversation_logs
      ORDER BY timestamp DESC
    `)
    .all() as ConversationRow[];

  return rows.map((row) => ({
    id: row.id,
    userMessage: row.user_message,
    timestamp: row.timestamp,
  }));
}

export function addToolLog(
  log: ToolExecutionLog,
) {
  db.prepare(`
    INSERT INTO tool_logs (
      id,
      tool_name,
      arguments_json,
      result_json,
      status,
      approval_id,
      duration_ms,
      error,
      timestamp
    )
    VALUES (
      @id,
      @toolName,
      @argumentsJson,
      @resultJson,
      @status,
      @approvalId,
      @durationMs,
      @error,
      @timestamp
    )
  `).run({
    id: log.id,
    toolName: log.toolName,
    argumentsJson: JSON.stringify(
      log.arguments,
    ),
    resultJson:
      log.result === undefined
        ? null
        : JSON.stringify(log.result),
    status: log.status,
    approvalId:
      log.approvalId ?? null,
    durationMs:
      log.durationMs ?? null,
    error:
      log.error ?? null,
    timestamp: log.timestamp,
  });
}

export function getToolLogs(): ToolExecutionLog[] {
  const rows = db
    .prepare(`
      SELECT
        id,
        tool_name,
        arguments_json,
        result_json,
        status,
        approval_id,
        duration_ms,
        error,
        timestamp
      FROM tool_logs
      ORDER BY timestamp DESC
    `)
    .all() as ToolLogRow[];

  return rows.map((row) => ({
    id: row.id,
    toolName: row.tool_name,
    arguments: JSON.parse(
      row.arguments_json,
    ) as Record<string, unknown>,
    result:
      row.result_json === null
        ? undefined
        : JSON.parse(row.result_json),
    status: row.status,
    approvalId:
      row.approval_id ?? undefined,
    durationMs:
      row.duration_ms ?? undefined,
    error:
      row.error ?? undefined,
    timestamp: row.timestamp,
  }));
}

export function addPolicyLog(
  log: Omit<PolicyLog, "id"> & {
    id?: string;
  },
) {
  db.prepare(`
    INSERT INTO policy_logs (
      id,
      type,
      tool_name,
      reason,
      timestamp
    )
    VALUES (
      @id,
      @type,
      @toolName,
      @reason,
      @timestamp
    )
  `).run({
    id: log.id ?? crypto.randomUUID(),
    type: log.type,
    toolName: log.toolName,
    reason: log.reason ?? null,
    timestamp: log.timestamp,
  });
}

export function getPolicyLogs(): PolicyLog[] {
  const rows = db
    .prepare(`
      SELECT
        id,
        type,
        tool_name,
        reason,
        timestamp
      FROM policy_logs
      ORDER BY timestamp DESC
    `)
    .all() as PolicyLogRow[];

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    toolName: row.tool_name,
    reason:
      row.reason ?? undefined,
    timestamp: row.timestamp,
  }));
}