export type ConversationLog = {
  id: string;
  userMessage: string;
  timestamp: string;
};

export type ToolExecutionLog = {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  result?: unknown;

  status:
    | "success"
    | "failed"
    | "approval_required";

  approvalId?: string;
  durationMs?: number;
  error?: string;
  timestamp: string;
};

export type PolicyLog = {
  id: string;

  type:
    | "allowed"
    | "denied"
    | "approval_required";

  toolName: string;
  reason?: string;
  timestamp: string;
};