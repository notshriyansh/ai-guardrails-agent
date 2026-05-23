import {
  AgentState,
  AgentStateAnnotation,
} from "../state";
import { executeTool } from "../../mcp/mcp-client";

export async function toolNode(
  state: AgentState,
): Promise<Partial<typeof AgentStateAnnotation.State>> {
  console.log("Running tool execution node");

  if (!state.selectedTool) {
    return {};
  }

  if (state.requiresApproval) {
    return {};
  }

  const result = await executeTool(
    state.selectedTool,
    state.toolArgs || {},
  );

  return {
    toolResult: result.content,
  };
}