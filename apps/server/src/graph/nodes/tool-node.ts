import crypto from "crypto";

import { AgentStateAnnotation } from "../state";

import { executeTool } from "../../mcp/mcp-client";

import { addToolLog } from "../../observability/log-store";

export async function toolNode(
  state: typeof AgentStateAnnotation.State,
): Promise<
  Partial<typeof AgentStateAnnotation.State>
> {
  console.log(
    "Running tool execution node",
  );

  if (state.finalResponse) {
    console.log(
      "Skipping tool execution because final response already exists",
    );

    return {};
  }

  if (!state.selectedTool) {
    console.log(
      "No selected tool",
    );

    return {};
  }

  if (state.requiresApproval) {
    console.log(
      "Execution requires approval",
    );

    return {};
  }

  const toolName =
    state.selectedTool;

  const toolArgs =
    state.toolArgs || {};

  const startedAt = Date.now();

  try {
    console.log(
      "Executing tool:",
      toolName,
    );

    console.log(
      "Tool args:",
      toolArgs,
    );

    const result =
      await executeTool(
        toolName,
        toolArgs,
      );

    const durationMs =
      Date.now() - startedAt;

    console.log(
      "Tool result:",
      JSON.stringify(
        result,
        null,
        2,
      ),
    );

    addToolLog({
      id: crypto.randomUUID(),

      toolName,

      arguments: toolArgs,

      result,

      status: "success",

      durationMs,

      timestamp:
        new Date().toISOString(),
    });

    return {
      toolResult: result,
    };
  } catch (error) {
    const durationMs =
      Date.now() - startedAt;

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Tool execution failed";

    console.error(
      "Tool execution failed:",
      error,
    );

    addToolLog({
      id: crypto.randomUUID(),

      toolName,

      arguments: toolArgs,

      status: "failed",

      durationMs,

      error: errorMessage,

      timestamp:
        new Date().toISOString(),
    });

    return {
      finalResponse:
        errorMessage,
    };
  }
}