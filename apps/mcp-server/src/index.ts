import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { calculatorTool } from "./tools/calculator.tool";
import { weatherTool } from "./tools/weather.tool";
import { jokeTool } from "./tools/joke.tool";
import {
  getLatestCommitsTool,
  getRepoInfoTool,
} from "./tools/github.tool";

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
      {
        name: "get_repo_info",

        description:
          "Retrieve repository metadata from GitHub including stars, forks, issues, description and repository URL.",

        inputSchema: {
          type: "object",

          properties: {
            owner: {
              type: "string",
            },

            repo: {
              type: "string",
            },
          },

          required: [
            "owner",
            "repo",
          ],
        },
      },

      {
        name: "get_latest_commits",

        description:
          "Retrieve the latest commits from a GitHub repository including commit message, author and SHA.",

        inputSchema: {
          type: "object",

          properties: {
            owner: {
              type: "string",
            },

            repo: {
              type: "string",
            },
          },

          required: [
            "owner",
            "repo",
          ],
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
    try {
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
    } catch (error) {
      console.error(
        "WEATHER TOOL FAILED:",
        error,
      );

      throw error;
    }
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

    if (name === "get_repo_info") {
    const result =
      await getRepoInfoTool({
        owner: String(
          args?.owner,
        ),

        repo: String(
          args?.repo,
        ),
      });

    return {
      content: [
        {
          type: "text",

          text: JSON.stringify(
            result,
            null,
            2,
          ),
        },
      ],
    };
  }

  if (
    name ===
    "get_latest_commits"
  ) {
    const result =
      await getLatestCommitsTool(
        {
          owner: String(
            args?.owner,
          ),

          repo: String(
            args?.repo,
          ),
        },
      );

    return {
      content: [
        {
          type: "text",

          text: JSON.stringify(
            result,
            null,
            2,
          ),
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
