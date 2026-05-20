import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mcpServers } from "./mcp-registry";

type ToolRegistryEntry = {
  serverId: string;
  client: Client;
};

const clients = new Map<string, Client>();

const toolRegistry = new Map<string, ToolRegistryEntry>();

export async function initializeMcpServers() {
  for (const server of mcpServers) {
    try {
      console.log(`Connecting to MCP server: ${server.id}`);

      const client = new Client({
        name: "ai-guardrails-agent",
        version: "1.0.0",
      });

      const transport = new StdioClientTransport({
        command: server.command,
        args: server.args,
        cwd: server.cwd,
      });

      await client.connect(transport);

      console.log(`Connected to MCP server: ${server.id}`);

      clients.set(server.id, client);

      const toolsResponse = await client.listTools();
      console.log(
        `Discovered ${toolsResponse.tools.length} tools from ${server.id}`,
      );

      for (const tool of toolsResponse.tools) {
        console.log(`Registering tool: ${tool.name}`);
        toolRegistry.set(tool.name, {
          serverId: server.id,
          client,
        });
      }
    } catch (error) {
      console.error(`Failed to initialize MCP server: ${server.id}`, error);
    }
  }
}

export async function getAllTools() {
  const allTools = [];

  for (const client of clients.values()) {
    const toolsResponse = await client.listTools();

    allTools.push(...toolsResponse.tools);
  }

  return allTools;
}

export async function executeTool(
  toolName: string,

  args: Record<string, unknown>,
) {
  const entry = toolRegistry.get(toolName);

  if (!entry) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  return entry.client.callTool({
    name: toolName,

    arguments: args ?? {},
  });
}
