import {
  AgentState,
  AgentStateAnnotation,
} from "../state";

import { evaluatePolicy } from "../../policy/policy-engine";

import {
  addPendingExecution,
} from "../../policy/pending-execution-store";

export async function policyNode(
  state: AgentState,
): Promise<
  Partial<typeof AgentStateAnnotation.State>
> {
  console.log("Running policy node");

  if (!state.selectedTool) {
    return {};
  }

  const decision =
    await evaluatePolicy({
      toolName: state.selectedTool,
      arguments:
        state.toolArgs || {},
    });

  if (decision.status === "denied") {
    return {
      finalResponse:
        `Tool blocked: ${decision.reason}`,

      policyRisk:
        decision.risk,
    };
  }


  if (
    decision.status ===
    "requires_approval"
  ) {
    addPendingExecution({
      approvalId:
        decision.approvalId,

      selectedTool:
        state.selectedTool,

      toolArgs:
        state.toolArgs || {},

      userMessage:
        state.userMessage,
    });

    return {
      requiresApproval: true,

      approvalId:
        decision.approvalId,

      approvalStatus:
        "pending",

      policyRisk:
        decision.risk,

      policyCapabilities:
        decision.capabilities,

      finalResponse:
        `Execution requires approval (${decision.approvalId})`,
    };
  }

  return {
    policyRisk:
      decision.risk,

    policyCapabilities:
      decision.capabilities,
  };
}