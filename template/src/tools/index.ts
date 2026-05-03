import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { wrap } from "../result.js";
import { EchoInput } from "../schemas.js";
import { echo } from "./echo.js";

export function registerTools(server: McpServer): void {
  server.registerTool(
    "echo",
    {
      title: "Echo",
      description: "Echo a message back. Replace this with your real tools.",
      inputSchema: EchoInput.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    wrap(echo),
  );
}
