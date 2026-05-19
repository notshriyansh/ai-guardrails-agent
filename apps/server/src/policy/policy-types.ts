export type ToolExecutionRequest = {
  toolName: string;
  arguments: Record<string, unknown>;
};

export type PolicyDecision =
  | {
      status: "allowed";
    }
  | {
      status: "denied";
      reason: string;
    }
  | {
      status: "requires_approval";
      approvalId: string;
      reason: string;
    };
