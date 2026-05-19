export type ToolExecutionRequest = {
  toolName: string;

  arguments: Record<string, unknown>;
};

export type PolicyDecision = {
  allowed: boolean;

  reason?: string;
};
