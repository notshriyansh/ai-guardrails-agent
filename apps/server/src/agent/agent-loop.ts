import crypto from "crypto";
import { HumanMessage } from "@langchain/core/messages"
import { agentGraph } from "../graph/graph";
import { addConversationLog } from "../observability/log-store";

export async function runAgent(userMessage: string) {
  addConversationLog({
    id: crypto.randomUUID(),
    userMessage,
    timestamp: new Date().toISOString(),
  });

  const result = await agentGraph.invoke({
    userMessage,
    messages: [new HumanMessage(userMessage)],
    retrievedMemories: [],
  });

  return {
    response: result.finalResponse,
  };
}