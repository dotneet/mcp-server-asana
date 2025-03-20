import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AsanaClientWrapper } from "../asana-client-wrapper.js";

// Task search tool
export const searchTasksTool = {
  name: "asana_search_tasks",
  description: "Search tasks in a workspace with advanced filtering options",
  inputSchema: {
    workspace: z.string(),
    text: z.string().optional(),
    resource_subtype: z.string().optional(),
    completed: z.boolean().optional(),
    sort_by: z.string().optional(),
    sort_ascending: z.boolean().optional(),
    opt_fields: z.string().optional(),
    custom_fields: z.record(z.any()).optional(),
  },
};

// Task retrieval tool
export const getTaskTool = {
  name: "asana_get_task",
  description: "Get detailed information about a specific task",
  inputSchema: {
    task_id: z.string(),
    opt_fields: z.string().optional(),
  },
};

// Task creation tool
export const createTaskTool = {
  name: "asana_create_task",
  description: "Create a new task in a project",
  inputSchema: {
    project_id: z.string(),
    name: z.string(),
    notes: z.string().optional(),
    html_notes: z.string().optional(),
    due_on: z.string().optional(),
    assignee: z.string().optional(),
    followers: z.array(z.string()).optional(),
    parent: z.string().optional(),
    projects: z.array(z.string()).optional(),
  },
};

// Task update tool
export const updateTaskTool = {
  name: "asana_update_task",
  description: "Update an existing task's details",
  inputSchema: {
    task_id: z.string(),
    name: z.string().optional(),
    notes: z.string().optional(),
    due_on: z.string().optional(),
    assignee: z.string().optional(),
    completed: z.boolean().optional(),
  },
};

// Subtask creation tool
export const createSubtaskTool = {
  name: "asana_create_subtask",
  description: "Create a new subtask for an existing task",
  inputSchema: {
    parent_task_id: z.string(),
    name: z.string(),
    notes: z.string().optional(),
    due_on: z.string().optional(),
    assignee: z.string().optional(),
    opt_fields: z.string().optional(),
  },
};

// Multiple task retrieval tool
export const getMultipleTasksByGidTool = {
  name: "asana_get_multiple_tasks_by_gid",
  description:
    "Get detailed information about multiple tasks by their GIDs (maximum 25 tasks)",
  inputSchema: {
    task_ids: z.union([z.array(z.string()), z.string()]),
    opt_fields: z.string().optional(),
  },
};

// Register task search tool
export function registerSearchTasksTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    searchTasksTool.name,
    searchTasksTool.inputSchema,
    async ({ workspace, ...searchOpts }) => {
      const response = await asanaClient.searchTasks(workspace, searchOpts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// タスク取得ツールの登録
export function registerGetTaskTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    getTaskTool.name,
    getTaskTool.inputSchema,
    async ({ task_id, ...opts }) => {
      const response = await asanaClient.getTask(task_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register task creation tool
export function registerCreateTaskTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    createTaskTool.name,
    createTaskTool.inputSchema,
    async ({ project_id, ...taskData }) => {
      const response = await asanaClient.createTask(project_id, taskData);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register task update tool
export function registerUpdateTaskTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    updateTaskTool.name,
    updateTaskTool.inputSchema,
    async ({ task_id, ...taskData }) => {
      const response = await asanaClient.updateTask(task_id, taskData);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register subtask creation tool
export function registerCreateSubtaskTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    createSubtaskTool.name,
    createSubtaskTool.inputSchema,
    async ({ parent_task_id, opt_fields, ...taskData }) => {
      const response = await asanaClient.createSubtask(
        parent_task_id,
        taskData,
        { opt_fields },
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register multiple task retrieval tool
export function registerGetMultipleTasksByGidTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    getMultipleTasksByGidTool.name,
    getMultipleTasksByGidTool.inputSchema,
    async ({ task_ids, ...opts }) => {
      // Process both array and comma-separated string inputs
      const taskIdList = Array.isArray(task_ids)
        ? task_ids
        : task_ids
            .split(",")
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0);
      const response = await asanaClient.getMultipleTasksByGid(
        taskIdList,
        opts,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register all task-related tools
export function registerAllTaskTools(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  registerSearchTasksTool(server, asanaClient);
  registerGetTaskTool(server, asanaClient);
  registerCreateTaskTool(server, asanaClient);
  registerUpdateTaskTool(server, asanaClient);
  registerCreateSubtaskTool(server, asanaClient);
  registerGetMultipleTasksByGidTool(server, asanaClient);
}
