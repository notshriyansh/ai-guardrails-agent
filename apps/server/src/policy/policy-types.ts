export type ToolExecutionRequest = {
  toolName: string;
  arguments: Record<string, unknown>;
};

export type PolicyDecision =
  | {
      status: "allowed";
      risk: "low" | "medium" | "high" | "critical";
      capabilities: string[];
    }
  | {
      status: "denied";
      reason: string;
      risk: "low" | "medium" | "high" | "critical";
    }
  | {
      status: "requires_approval";
      approvalId: string;
      reason: string;
      risk: "low" | "medium" | "high" | "critical";
      capabilities: string[];
    };
