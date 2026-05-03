#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerTools } from "./tools/index.js";

async function main(): Promise<void> {
  const server = new McpServer({
    name: "__BIN_NAME__",
    version: "0.1.0",
  });

  registerTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdout is reserved for JSON-RPC traffic — log to stderr only.
  console.error("__BIN_NAME__ ready");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
