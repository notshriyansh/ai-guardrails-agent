import { Client } from "@modelcontextprotocol/sdk/client/index.js";

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function createMcpClient() {
  const client = new Client({
    name: "ai-guardrails-agent",
    version: "1.0.0",
  });

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["tsx", "src/index.ts"],
    cwd: "../mcp-server",
  });

  await client.connect(transport);

  return client;
}
