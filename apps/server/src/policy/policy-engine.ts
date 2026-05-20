import crypto from "crypto";
import { eventBus } from "../events/event-bus";
import { PolicyDecision, ToolExecutionRequest } from "./policy-types";
import { getPolicyState } from "./policy-store";
import { createApproval } from "./approval-store";
import { addPolicyLog } from "../observability/log-store";

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

    addPolicyLog({
      type: "denied",
      toolName: request.toolName,
      reason: decision.reason,
      timestamp: new Date().toISOString(),
    });

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

      addPolicyLog({
        type: "denied",
        toolName: request.toolName,
        reason: decision.reason,
        timestamp: new Date().toISOString(),
      });

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

    addPolicyLog({
      type: "approval_required",
      toolName: request.toolName,
      reason: decision.reason,
      timestamp: new Date().toISOString(),
    });

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

  addPolicyLog({
    type: "allowed",
    toolName: request.toolName,
    timestamp: new Date().toISOString(),
  });

  eventBus.emit("policy.allowed", {
    toolName: request.toolName,

    timestamp: new Date().toISOString(),
  });

  return decision;
}
