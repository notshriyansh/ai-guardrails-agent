import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "notes-mcp-server",
    version: "1.0.0",
  },

  {
    capabilities: {
      tools: {},
    },
  },
);

const notes: string[] = [];

server.setRequestHandler(
  ListToolsRequestSchema,

  async () => {
    return {
      tools: [
        {
          name: "add_note",
          description: "Add a note to memory",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
        },

        {
          name: "list_notes",
          description: "List all notes",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      ],
    };
  },
);

server.setRequestHandler(
  CallToolRequestSchema,

  async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments ?? {};

    if (toolName === "add_note") {
      const note = String(args.note);

      notes.push(note);

      return {
        content: [
          {
            type: "text",

            text: `Note added: ${note}`,
          },
        ],
      };
    }

    if (toolName === "list_notes") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(notes, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${toolName}`);
  },
);

const transport = new StdioServerTransport();

await server.connect(transport);

console.error("Notes MCP server running");
