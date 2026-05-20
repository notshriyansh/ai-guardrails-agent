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
            properties: {
              note: {
                type: "string",
              },
            },
            required: ["note"],
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

        {
          name: "delete_note",
          description: "Delete a note by text",
          inputSchema: {
            type: "object",
            properties: {
              note: {
                type: "string",
              },
            },
            required: ["note"],
          },
        },

        {
          name: "clear_notes",
          description: "Remove all notes",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
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

    if (toolName === "delete_note") {
      const note = String(args.note);

      const index = notes.indexOf(note);

      if (index >= 0) {
        notes.splice(index, 1);

        return {
          content: [
            {
              type: "text",
              text: `Deleted note: ${note}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",

            text: "Note not found",
          },
        ],
      };
    }

    if (toolName === "clear_notes") {
      notes.length = 0;

      return {
        content: [
          {
            type: "text",
            text: "All notes cleared",
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
