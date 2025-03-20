import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AsanaClientWrapper } from "../asana-client-wrapper.js";

// Get tasks associated with a specific tag tool
export const getTasksForTagTool = {
  name: "asana_get_tasks_for_tag",
  description: "Get tasks associated with a specific tag",
  inputSchema: {
    tag_gid: z.string(),
    opt_fields: z.string().optional(),
  },
};

// Get all tags in a workspace tool
export const getTagsForWorkspaceTool = {
  name: "asana_get_tags_for_workspace",
  description: "Get all tags in a workspace",
  inputSchema: {
    workspace_gid: z.string(),
    opt_fields: z.string().optional(),
  },
};

// Register get tasks for tag tool
export function registerGetTasksForTagTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    getTasksForTagTool.name,
    getTasksForTagTool.inputSchema,
    async ({ tag_gid, ...opts }) => {
      const response = await asanaClient.getTasksForTag(tag_gid, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register get tags for workspace tool
export function registerGetTagsForWorkspaceTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    getTagsForWorkspaceTool.name,
    getTagsForWorkspaceTool.inputSchema,
    async ({ workspace_gid, ...opts }) => {
      const response = await asanaClient.getTagsForWorkspace(
        workspace_gid,
        opts,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register all tag-related tools
export function registerAllTagTools(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  registerGetTasksForTagTool(server, asanaClient);
  registerGetTagsForWorkspaceTool(server, asanaClient);
}
