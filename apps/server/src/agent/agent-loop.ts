import { groq } from "./groq-client";

import { createMcpClient } from "../mcp/mcp-client";
import { evaluatePolicy } from "../policy/policy-engine";

export async function runAgent(userMessage: string) {
  const mcp = await createMcpClient();
  const toolsResponse = await mcp.listTools();

  const tools = toolsResponse.tools.map((tool) => ({
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
        role: "user",
        content: userMessage,
      },
    ],

    tools,
    tool_choice: "auto",
  });

  const message = completion.choices[0].message;

  if (message.tool_calls?.length) {
    const toolCall = message.tool_calls[0];

    if (toolCall.type !== "function") {
      throw new Error("Unsupported tool call type");
    }

    const toolName = toolCall.function.name;

    const toolArgs = JSON.parse(toolCall.function.arguments);

    const policyDecision = await evaluatePolicy({
      toolName,

      arguments: toolArgs,
    });

    if (!policyDecision.allowed) {
      return {
        response: `Tool execution blocked: ${policyDecision.reason}`,
      };
    }

    const toolResult = await mcp.callTool({
      name: toolName,
      arguments: toolArgs,
    });

    const finalCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",
          content: userMessage,
        },

        message,

        {
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult.content),
        },
      ],
    });

    return {
      response: finalCompletion.choices[0].message.content,
    };
  }

  return {
    response: message.content,
  };
}
