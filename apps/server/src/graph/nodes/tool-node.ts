import { AgentStateAnnotation } from "../state";

import { executeTool } from "../../mcp/mcp-client";

export async function toolNode(
  state: typeof AgentStateAnnotation.State,
): Promise<Partial<typeof AgentStateAnnotation.State>> {
  console.log("Running tool execution node");

  if (state.finalResponse) {
    console.log(
      "Skipping tool execution because final response already exists",
    );

    return {};
  }

  if (!state.selectedTool) {
    console.log("No selected tool");

    return {};
  }

  if (state.requiresApproval) {
    console.log(
      "Execution requires approval",
    );

    return {};
  }

  try {
    console.log(
      "Executing tool:",
      state.selectedTool,
    );

    console.log(
      "Tool args:",
      state.toolArgs,
    );

    const result =
      await executeTool(
        state.selectedTool,
        state.toolArgs || {},
      );

    console.log(
      "Tool result:",
      JSON.stringify(
        result,
        null,
        2,
      ),
    );

    return {
      toolResult: result,
    };
  } catch (error) {
    console.error(
      "Tool execution failed:",
      error,
    );

    return {
      finalResponse:
        error instanceof Error
          ? error.message
          : "Tool execution failed",
    };
  }
}