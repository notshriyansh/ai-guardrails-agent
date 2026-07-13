import crypto from "crypto";
import { eventBus } from "../events/event-bus";
import {
  PolicyDecision,
  ToolExecutionRequest,
} from "./policy-types";
import { getPolicyState } from "./policy-store";
import { createApproval } from "./approval-store";
import { addPolicyLog } from "../observability/log-store";

export async function evaluatePolicy(
  request: ToolExecutionRequest,
): Promise<PolicyDecision> {
  console.log(
    "[POLICY] Evaluating:",
    request.toolName,
    request.arguments,
  );

  eventBus.emit("policy.check", {
    toolName: request.toolName,
    arguments: request.arguments,
    timestamp: new Date().toISOString(),
  });

  const policyState = getPolicyState();

  if (
    policyState.blockedTools.includes(
      request.toolName,
    )
  ) {
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

  if (request.toolName === "calculator") {
    const expression = String(
      request.arguments.expression ?? "",
    );

    console.log(
      "[POLICY] Calculator expression:",
      expression,
    );

    const dangerousPatterns = [
      "process",
      "require",
      "global",
      "import",
      "fetch",
      "eval",
      "function",
      "constructor",
      "child_process",
      "fs",
      "exec",
      "spawn",
      "window",
      "document",
    ];

    const matchedPattern =
      dangerousPatterns.find((pattern) =>
        expression
          .toLowerCase()
          .includes(pattern),
      );

    if (matchedPattern) {
      console.log(
        "[POLICY] BLOCKED calculator input. Matched:",
        matchedPattern,
      );

      const decision = {
        status: "denied" as const,

        reason: `Suspicious calculator input detected (${matchedPattern})`,
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

    console.log(
      "[POLICY] Calculator input passed security checks",
    );
  }

  if (request.toolName === "get_weather") {
    const approvalId =
      crypto.randomUUID();

    createApproval({
      id: approvalId,
      toolName: request.toolName,
      arguments: request.arguments,
      reason:
        "Weather access requires approval",
      createdAt:
        new Date().toISOString(),
    });

    const decision = {
      status:
        "requires_approval" as const,

      approvalId,

      reason:
        "Human approval required",
    };

    addPolicyLog({
      type: "approval_required",
      toolName: request.toolName,
      reason: decision.reason,
      timestamp:
        new Date().toISOString(),
    });

    eventBus.emit(
      "policy.approval_requested",
      {
        approvalId,
        toolName:
          request.toolName,
        timestamp:
          new Date().toISOString(),
      },
    );

    return decision;
  }

  const decision = {
    status: "allowed" as const,
  };

  addPolicyLog({
    type: "allowed",
    toolName: request.toolName,
    timestamp:
      new Date().toISOString(),
  });

  eventBus.emit("policy.allowed", {
    toolName: request.toolName,

    timestamp:
      new Date().toISOString(),
  });

  return decision;
}