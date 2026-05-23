import { HumanMessage } from "@langchain/core/messages";
import {
  AgentState,
  AgentStateAnnotation,
} from "../state";
import { groq } from "../../agent/groq-client";
import { getAllTools } from "../../mcp/mcp-client";

export async function reasoningNode(
  state: AgentState,
): Promise<Partial<typeof AgentStateAnnotation.State>> {
  console.log("Running reasoning node");

  const tools = (await getAllTools()).map((tool) => ({
    type: "function" as const,

    function: {
      name: tool.name,
      description: tool.description || "",
      parameters: tool.inputSchema,
    },
  }));

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",

    messages: [
      {
        role: "system",

        content:
          "You are a governed AI agent. Use tools when appropriate.",
      },

      {
        role: "user",
        content: state.userMessage,
      },
    ],

    tools,
    tool_choice: "auto",
  });

  const message = completion.choices[0].message;

  if (!message.tool_calls?.length) {
    return {
      finalResponse: message.content || "No response generated",
    };
  }

  const toolCall = message.tool_calls[0];

  if (toolCall.type !== "function") {
    throw new Error("Unsupported tool call type");
  }

  return {
    selectedTool: toolCall.function.name,

    toolArgs: JSON.parse(toolCall.function.arguments || "{}"),

    messages: [
      ...state.messages,
      new HumanMessage(state.userMessage),
    ],
  };
}