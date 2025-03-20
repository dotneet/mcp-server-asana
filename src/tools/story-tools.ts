import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AsanaClientWrapper } from "../asana-client-wrapper.js";

// Get task stories tool
export const getStoriesForTaskTool = {
  name: "asana_get_task_stories",
  description: "Get comments and stories for a specific task",
  inputSchema: {
    task_id: z.string(),
    opt_fields: z.string().optional(),
  },
};

// Create task story tool
export const createTaskStoryTool = {
  name: "asana_create_task_story",
  description: "Create a comment or story on a task",
  inputSchema: {
    task_id: z.string(),
    text: z.string(),
    opt_fields: z.string().optional(),
  },
};

// Register get task stories tool
export function registerGetStoriesForTaskTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    getStoriesForTaskTool.name,
    getStoriesForTaskTool.inputSchema,
    async ({ task_id, ...opts }) => {
      const response = await asanaClient.getStoriesForTask(task_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register create task story tool
export function registerCreateTaskStoryTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    createTaskStoryTool.name,
    createTaskStoryTool.inputSchema,
    async ({ task_id, text, ...opts }) => {
      const response = await asanaClient.createTaskStory(task_id, text, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register all story-related tools
export function registerAllStoryTools(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  registerGetStoriesForTaskTool(server, asanaClient);
  registerCreateTaskStoryTool(server, asanaClient);
}
