import {
  AgentState,
  AgentStateAnnotation,
} from "../state";
import { groq } from "../../agent/groq-client";

export async function responseNode(
  state: AgentState,
): Promise<Partial<typeof AgentStateAnnotation.State>> {
  console.log("Running response node");

  if (state.finalResponse) {
    return {};
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",

    messages: [
      {
        role: "system",
        content: "Generate a helpful final response.",
      },

      {
        role: "user",
        content: state.userMessage,
      },

      {
        role: "assistant",
        content: `Tool result: ${JSON.stringify(state.toolResult)}`,
      },
    ],
  });

  return {
    finalResponse:
      completion.choices[0].message.content ||
      "No final response generated",
  };
}