import { AgentStateAnnotation } from "../state";

import { executeTool } from "../../mcp/mcp-client";

export async function toolNode(
  state: typeof AgentStateAnnotation.State,
): Promise<Partial<typeof AgentStateAnnotation.State>> {
  console.log("Running tool execution node");

  if (!state.selectedTool) {
    console.log("No selected tool");

    return {};
  }

  if (state.requiresApproval) {
    console.log("Execution requires approval");

    return {};
  }

  console.log("Executing tool:", state.selectedTool);

  console.log("Tool args:", state.toolArgs);

  const result = await executeTool(
    state.selectedTool,
    state.toolArgs || {},
  );

  console.log(
    "Raw tool result:",
    JSON.stringify(result, null, 2),
  );

  return {
    toolResult: result,
  };
}