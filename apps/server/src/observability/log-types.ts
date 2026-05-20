export type ConversationLog = {
  id: string;
  userMessage: string;
  timestamp: string;
};

export type ToolExecutionLog = {
  toolName: string;
  arguments: Record<string, unknown>;
  timestamp: string;
};

export type PolicyLog = {
  type: "allowed" | "denied" | "approval_required";
  toolName: string;
  reason?: string;
  timestamp: string;
};
