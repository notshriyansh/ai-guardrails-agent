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

You have access to tools.

When a user's request can be answered using a tool,
you MUST choose the most appropriate tool.

Retrieved memories:

${state.retrievedMemories.join("\n")}

Available tools:

${toolDescriptions}

Tool Usage Guidelines:

- Use get_weather for weather questions.
- Use calculator for mathematical calculations.
- Use get_repo_info when asked about a GitHub repository.
- Use get_latest_commits when asked about recent commits.
- Use save_memory when the user asks you to remember something.
- Use search_memory when the user asks about something remembered previously.

Respond ONLY with valid JSON.

If a tool is required:

{
  "tool": "tool_name",
  "arguments": {
    ...
  }
}

If no tool is required:

{
  "response": "answer"
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

  console.log(
    "Reasoning output:",
    raw,
  );

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

  const selectedTool =
  parsed.tool || state.plannedTool;

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