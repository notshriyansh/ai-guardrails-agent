import { eventBus } from "../events/event-bus";

import { PolicyDecision, ToolExecutionRequest } from "./policy-types";

import { blockedTools } from "./default-policies";

export async function evaluatePolicy(
  request: ToolExecutionRequest,
): Promise<PolicyDecision> {
  eventBus.emit("policy.check", {
    toolName: request.toolName,
    arguments: request.arguments,
    timestamp: new Date().toISOString(),
  });

  if (blockedTools.includes(request.toolName)) {
    const decision = {
      allowed: false,

      reason: `Tool "${request.toolName}" is blocked by policy`,
    };

    eventBus.emit("policy.denied", {
      ...decision,

      toolName: request.toolName,

      timestamp: new Date().toISOString(),
    });

    return decision;
  }

  if (
    request.toolName === "calculator" &&
    typeof request.arguments.expression === "string"
  ) {
    const expression = request.arguments.expression as string;

    if (expression.includes("process") || expression.includes("require")) {
      const decision = {
        allowed: false,

        reason: "Suspicious calculator input detected",
      };

      eventBus.emit("policy.denied", {
        ...decision,

        toolName: request.toolName,

        timestamp: new Date().toISOString(),
      });

      return decision;
    }
  }

  const decision = {
    allowed: true,
  };

  eventBus.emit("policy.allowed", {
    toolName: request.toolName,

    timestamp: new Date().toISOString(),
  });

  return decision;
}
