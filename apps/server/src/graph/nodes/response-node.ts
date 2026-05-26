import { AgentStateAnnotation } from "../state";

import { groq } from "../../agent/groq-client";

export async function responseNode(
  state: typeof AgentStateAnnotation.State,
): Promise<Partial<typeof AgentStateAnnotation.State>> {
  console.log("Running response node");

  if (state.finalResponse) {
    return {};
  }

  let toolOutput = "";

  try {
    toolOutput =
      (state.toolResult as any)?.content?.[0]?.text ||
      JSON.stringify(state.toolResult);
  } catch (error) {
    console.error("Failed to parse tool output:", error);
  }

  console.log("Parsed tool output:", toolOutput);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",

    messages: [
      {
        role: "system",

        content: `
You are an AI assistant.

Answer the user using the provided tool output.

If the tool output contains useful information,
answer directly and clearly.
`,
      },

      {
        role: "user",
        content: state.userMessage,
      },

      {
        role: "assistant",
        content: `Tool output: ${toolOutput}`,
      },
    ],
  });

  return {
    finalResponse:
      completion.choices[0].message.content ||
      "No final response generated",
  };
}