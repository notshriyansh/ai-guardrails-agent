import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { calculatorTool } from "./tools/calculator.tool";
import { weatherTool } from "./tools/weather.tool";
import { jokeTool } from "./tools/joke.tool";

const server = new Server(
  {
    name: "custom-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calculator",
        description: "Evaluate mathematical expressions",
        inputSchema: {
          type: "object",
          properties: {
            expression: {
              type: "string",
            },
          },
          required: ["expression"],
        },
      },

      {
        name: "get_weather",
        description: "Get weather information by city",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
            },
          },
          required: ["city"],
        },
      },

      {
        name: "tell_joke",
        description: "Tell a programming joke",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "calculator") {
    const result = await calculatorTool({
      expression: String(args?.expression),
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ],
    };
  }

  if (name === "get_weather") {
    const result = await weatherTool({
      city: String(args?.city),
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ],
    };
  }

  if (name === "tell_joke") {
    const result = await jokeTool();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("Custom MCP server running over stdio");
}

main().catch((error) => {
  console.error("MCP server failed", error);

  process.exit(1);
});
