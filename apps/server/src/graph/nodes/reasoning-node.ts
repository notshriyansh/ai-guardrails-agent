import { HumanMessage } from "@langchain/core/messages";

import { AgentStateAnnotation } from "../state";

import { groq } from "../../agent/groq-client";

import { getAllTools } from "../../mcp/mcp-client";

export async function reasoningNode(
  state: typeof AgentStateAnnotation.State,
): Promise<Partial<typeof AgentStateAnnotation.State>> {
  console.log("Running reasoning node");

  const tools = await getAllTools();

  console.log(
  "Available tools:",
  JSON.stringify(tools, null, 2),
);

  const toolDescriptions = tools
    .map(
      (tool) => `
Tool Name: ${tool.name}
Description: ${tool.description}
Schema: ${JSON.stringify(tool.inputSchema)}
`,
    )
    .join("\n");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    response_format: {
      type: "json_object",
    },

    messages: [
  {
    role: "system",

    content: `
You are an AI orchestration agent.

You may choose tools when appropriate.

Retrieved memories:

${state.retrievedMemories.join("\n")}

Available tools:

${toolDescriptions}

IMPORTANT:

Respond ONLY with valid JSON.

If no tool is needed:

{
  "response": "your response"
}

If a tool IS needed:

{
  "tool": "tool_name",
  "arguments": {
    "key": "value"
  }
}
`,
  },

  {
    role: "user",
    content: state.userMessage,
  },
],
  });

  const raw = completion.choices[0].message.content;

  if (!raw) {
    return {
      finalResponse: "No response generated",
    };
  }

  let parsed: any;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse reasoning output:", raw);

    return {
      finalResponse: "Failed to parse model response",
    };
  }

  if (!parsed.tool) {
    const selectedTool =
  state.plannedTool || parsed.tool;

  if (!selectedTool) {
    return {
      finalResponse:
        parsed.response || "No response generated",
    };
}

let toolArgs = parsed.arguments || {};

if (
  selectedTool === "save_memory" &&
  !toolArgs.text
) {
  toolArgs = {
    text: state.userMessage,
  };
}

if (
  selectedTool === "search_memory" &&
  !toolArgs.query
) {
  toolArgs = {
    query: state.userMessage,
  };
}

return {
  selectedTool,
  toolArgs,
  messages: [
    ...state.messages,
    new HumanMessage(state.userMessage),
  ],
};
  }

  return {
    selectedTool: parsed.tool,
    toolArgs: parsed.arguments || {},
    messages: [
      ...state.messages,
      new HumanMessage(state.userMessage),
    ],
  };
}