import { AgentStateAnnotation } from "../state";

import { executeTool } from "../../mcp/mcp-client";

export async function memoryNode(
  state: typeof AgentStateAnnotation.State,
): Promise<Partial<typeof AgentStateAnnotation.State>> {
  console.log("Running memory retrieval node");

  try {
    const result = await executeTool("search_memory", {
      query: state.userMessage,
    });

    const raw = (result.content as any)?.[0]?.text;

    if (!raw) {
      return {
        retrievedMemories: [],
      };
    }

    const parsed = JSON.parse(raw);

    const memories = parsed.map(
      (entry: any) => entry.memory.text,
    );

    return {
      retrievedMemories: memories,
    };
  } catch (error) {
    console.error("Memory retrieval failed:", error);

    return {
      retrievedMemories: [],
    };
  }
}