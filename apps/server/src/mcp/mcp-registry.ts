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
  {
  id: "filesystem-tools",

  command: process.platform === "win32" ? "cmd" : "npx",

  args:
    process.platform === "win32"
      ? [
          "/c",
          "npx",
          "@modelcontextprotocol/server-filesystem",
          process.cwd(),
        ]
      : [
          "@modelcontextprotocol/server-filesystem",
          process.cwd(),
        ],
  cwd: process.cwd(),
},
];
