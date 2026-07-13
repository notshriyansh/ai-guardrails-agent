export const mcpServers = [
  {
    id: "core-tools",
    command: "node",
    args: ["dist/index.js"],
    cwd: "../mcp-server",
  },
  {
    id: "notes-tools",
    command: "node",
    args: ["dist/index.js"],
    cwd: "../notes-mcp-server",
  },
];
