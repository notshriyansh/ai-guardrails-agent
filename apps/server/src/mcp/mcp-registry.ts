export const mcpServers = [
  {
    id: "core-tools",
    command: "npx",
    args: ["tsx", "src/index.ts"],
    cwd: "../mcp-server",
  },
  {
    id: "notes-tools",
    command: "npx",
    args: ["tsx", "src/index.ts"],
    cwd: "../notes-mcp-server",
  },
  {
    id: "filesystem-tools",
    command: "cmd",
    args: [
      "/c",
      "npx",
      "@modelcontextprotocol/server-filesystem",
      process.cwd(),
    ],
    cwd: process.cwd(),
  },
];
