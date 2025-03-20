import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AsanaClientWrapper } from "../asana-client-wrapper.js";

// Task dependency addition tool
export const addTaskDependenciesTool = {
  name: "asana_add_task_dependencies",
  description: "Set dependencies for a task",
  inputSchema: {
    task_id: z.string(),
    dependencies: z.array(z.string()),
  },
};

// Task dependent addition tool
export const addTaskDependentsTool = {
  name: "asana_add_task_dependents",
  description: "Set dependents for a task (tasks that depend on this task)",
  inputSchema: {
    task_id: z.string(),
    dependents: z.array(z.string()),
  },
};

// Task parent setting tool
export const setParentForTaskTool = {
  name: "asana_set_parent_for_task",
  description: "Set a parent task for a task",
  inputSchema: {
    data: z.union([z.string(), z.record(z.any())]),
    task_id: z.string(),
    opts: z.union([z.string(), z.record(z.any())]).optional(),
  },
};

// Register task dependency addition tool
export function registerAddTaskDependenciesTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    addTaskDependenciesTool.name,
    addTaskDependenciesTool.inputSchema,
    async ({ task_id, dependencies }) => {
      const response = await asanaClient.addTaskDependencies(
        task_id,
        dependencies,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register task dependent addition tool
export function registerAddTaskDependentsTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    addTaskDependentsTool.name,
    addTaskDependentsTool.inputSchema,
    async ({ task_id, dependents }) => {
      const response = await asanaClient.addTaskDependents(task_id, dependents);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register task parent setting tool
export function registerSetParentForTaskTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    setParentForTaskTool.name,
    setParentForTaskTool.inputSchema,
    async ({ data, task_id, opts }) => {
      if (typeof data === "string") {
        data = JSON.parse(data);
      }
      if (typeof opts === "string") {
        opts = JSON.parse(opts);
      }
      const response = await asanaClient.setParentForTask(data, task_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register all task relationship-related tools
export function registerAllTaskRelationshipTools(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  registerAddTaskDependenciesTool(server, asanaClient);
  registerAddTaskDependentsTool(server, asanaClient);
  registerSetParentForTaskTool(server, asanaClient);
}
