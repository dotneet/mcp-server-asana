import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AsanaClientWrapper } from "../asana-client-wrapper.js";

// Workspace list tool
export const listWorkspacesTool = {
  name: "asana_list_workspaces",
  description: "List all available workspaces in Asana",
  inputSchema: {
    opt_fields: z.string().optional(),
  },
};

// Register workspace list tool
export function registerListWorkspacesTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    listWorkspacesTool.name,
    listWorkspacesTool.inputSchema,
    async (args) => {
      const response = await asanaClient.listWorkspaces(args);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register all workspace-related tools
export function registerAllWorkspaceTools(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  registerListWorkspacesTool(server, asanaClient);
}
