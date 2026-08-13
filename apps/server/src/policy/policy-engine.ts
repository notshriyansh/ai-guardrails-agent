import crypto from "crypto";
import { eventBus } from "../events/event-bus";
import {
  PolicyDecision,
  ToolExecutionRequest,
} from "./policy-types";
import { getPolicyState } from "./policy-store";
import { toolPolicies } from "./tool-policy";
import { createApproval } from "./approval-store";
import { addPolicyLog } from "../observability/log-store";
import {
  validateCalculatorArguments,
} from "./validators/calculator-validator";

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

  const toolPolicy =
    toolPolicies[request.toolName];

  if (!toolPolicy) {
    const reason =
      `Tool "${request.toolName}" has no registered security policy`;

    addPolicyLog({
      type: "denied",
      toolName: request.toolName,
      reason,
      timestamp: new Date().toISOString(),
    });

    eventBus.emit("policy.denied", {
      toolName: request.toolName,
      reason,
      timestamp: new Date().toISOString(),
    });

    return {
      status: "denied",
      reason,
      risk: "critical",
    };
  }

  const policyState =
    getPolicyState();

  if (
    policyState.blockedTools.includes(
      request.toolName,
    )
  ) {
    const reason =
      `Tool "${request.toolName}" is blocked by policy`;

    addPolicyLog({
      type: "denied",
      toolName: request.toolName,
      reason,
      timestamp: new Date().toISOString(),
    });

    eventBus.emit("policy.denied", {
      toolName: request.toolName,
      reason,
      risk: toolPolicy.risk,
      capabilities:
        toolPolicy.capabilities,
      timestamp: new Date().toISOString(),
    });

    return {
      status: "denied",
      reason,
      risk: toolPolicy.risk,
    };
  }

  if (request.toolName === "calculator") {
    const validationError =
      validateCalculatorArguments(
        request.arguments,
      );

    if (validationError) {
      addPolicyLog({
        type: "denied",
        toolName: request.toolName,
        reason: validationError,
        timestamp:
          new Date().toISOString(),
      });

      eventBus.emit("policy.denied", {
        toolName: request.toolName,
        reason: validationError,
        risk: toolPolicy.risk,
        capabilities:
          toolPolicy.capabilities,
        timestamp:
          new Date().toISOString(),
      });

      return {
        status: "denied",
        reason: validationError,
        risk: toolPolicy.risk,
      };
    }
  }

  if (toolPolicy.requiresApproval) {
    const approvalId =
      crypto.randomUUID();

    const reason =
      `Tool "${request.toolName}" requires human approval`;

    createApproval({
      id: approvalId,

      toolName:
        request.toolName,

      arguments:
        request.arguments,

      reason,

      createdAt:
        new Date().toISOString(),
    });

    addPolicyLog({
      type: "approval_required",

      toolName:
        request.toolName,

      reason,

      timestamp:
        new Date().toISOString(),
    });

    eventBus.emit(
      "policy.approval_requested",
      {
        approvalId,

        toolName:
          request.toolName,

        risk:
          toolPolicy.risk,

        capabilities:
          toolPolicy.capabilities,

        timestamp:
          new Date().toISOString(),
      },
    );

    return {
      status: "requires_approval",

      approvalId,

      reason,

      risk:
        toolPolicy.risk,

      capabilities:
        toolPolicy.capabilities,
    };
  }

  addPolicyLog({
    type: "allowed",

    toolName:
      request.toolName,

    timestamp:
      new Date().toISOString(),
  });

  eventBus.emit("policy.allowed", {
    toolName:
      request.toolName,

    risk:
      toolPolicy.risk,

    capabilities:
      toolPolicy.capabilities,

    timestamp:
      new Date().toISOString(),
  });

  return {
    status: "allowed",

    risk:
      toolPolicy.risk,

    capabilities:
      toolPolicy.capabilities,
  };
}