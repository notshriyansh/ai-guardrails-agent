import {
  AgentState,
  AgentStateAnnotation,
} from "../state";

export async function memoryNode(
  state: AgentState,
): Promise<Partial<typeof AgentStateAnnotation.State>> {
  console.log("Running memory retrieval node");

  return {
    retrievedMemories: [],
  };
}