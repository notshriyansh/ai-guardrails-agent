import crypto from "crypto";
import { eventBus } from "../events/event-bus";
import { PolicyDecision, ToolExecutionRequest } from "./policy-types";
import { getPolicyState } from "./policy-store";
import { createApproval } from "./approval-store";

export async function evaluatePolicy(
  request: ToolExecutionRequest,
): Promise<PolicyDecision> {
  eventBus.emit("policy.check", {
    toolName: request.toolName,
    arguments: request.arguments,
    timestamp: new Date().toISOString(),
  });

  const policyState = getPolicyState();

  if (policyState.blockedTools.includes(request.toolName)) {
    const decision = {
      status: "denied" as const,
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
        status: "denied" as const,
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

  if (request.toolName === "get_weather") {
    const approvalId = crypto.randomUUID();

    createApproval({
      id: approvalId,
      toolName: request.toolName,
      arguments: request.arguments,
      reason: "Weather access requires approval",
      createdAt: new Date().toISOString(),
    });

    const decision = {
      status: "requires_approval" as const,
      approvalId,
      reason: "Human approval required",
    };

    eventBus.emit("policy.approval_requested", {
      approvalId,
      toolName: request.toolName,
      timestamp: new Date().toISOString(),
    });

    return decision;
  }

  const decision = {
    status: "allowed" as const,
  };

  eventBus.emit("policy.allowed", {
    toolName: request.toolName,

    timestamp: new Date().toISOString(),
  });

  return decision;
}
