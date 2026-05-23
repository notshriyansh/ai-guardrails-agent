import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  deleteMemory,
  getRecentMemories,
  saveMemory,
  searchMemories,
} from "./memory-store.js";

const server = new Server(
  {
    name: "memory-mcp-server",
    version: "2.0.0",
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
        name: "save_memory",
        description: "Store a memory into long term semantic memory",

        inputSchema: {
          type: "object",

          properties: {
            text: {
              type: "string",
            },
          },

          required: ["text"],
        },
      },

      {
        name: "search_memory",
        description: "Search semantic memories using similarity search",

        inputSchema: {
          type: "object",

          properties: {
            query: {
              type: "string",
            },
          },

          required: ["query"],
        },
      },

      {
        name: "get_recent_memories",
        description: "Retrieve recent memories",

        inputSchema: {
          type: "object",
          properties: {},
        },
      },

      {
        name: "delete_memory",
        description: "Delete memory by id",

        inputSchema: {
          type: "object",

          properties: {
            id: {
              type: "string",
            },
          },

          required: ["id"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments ?? {};

  if (toolName === "save_memory") {
    const result = await saveMemory(String(args.text));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  if (toolName === "search_memory") {
    const result = await searchMemories(String(args.query));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  if (toolName === "get_recent_memories") {
    const result = getRecentMemories();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  if (toolName === "delete_memory") {
    const deleted = deleteMemory(String(args.id));

    return {
      content: [
        {
          type: "text",
          text: deleted ? "Memory deleted" : "Memory not found",
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${toolName}`);
});

const transport = new StdioServerTransport();

await server.connect(transport);

console.error("Memory MCP server running");
