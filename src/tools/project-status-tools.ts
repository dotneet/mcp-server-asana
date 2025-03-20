import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AsanaClientWrapper } from "../asana-client-wrapper.js";

// Project status retrieval tool
export const getProjectStatusTool = {
  name: "asana_get_project_status",
  description: "Get a project status update",
  inputSchema: {
    project_status_gid: z.string(),
    opt_fields: z.string().optional(),
  },
};

// Project status list retrieval tool
export const getProjectStatusesForProjectTool = {
  name: "asana_get_project_statuses",
  description: "Get all status updates for a project",
  inputSchema: {
    project_gid: z.string(),
    limit: z.number().optional(),
    offset: z.string().optional(),
    opt_fields: z.string().optional(),
  },
};

// Project status creation tool
export const createProjectStatusTool = {
  name: "asana_create_project_status",
  description: "Create a new status update for a project",
  inputSchema: {
    project_gid: z.string(),
    text: z.string(),
    color: z.enum(["green", "yellow", "red"]).optional(),
    title: z.string().optional(),
    html_text: z.string().optional(),
    opt_fields: z.string().optional(),
  },
};

// Project status deletion tool
export const deleteProjectStatusTool = {
  name: "asana_delete_project_status",
  description: "Delete a project status update",
  inputSchema: {
    project_status_gid: z.string(),
  },
};

// Register project status retrieval tool
export function registerGetProjectStatusTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    getProjectStatusTool.name,
    getProjectStatusTool.inputSchema,
    async ({ project_status_gid, ...opts }) => {
      const response = await asanaClient.getProjectStatus(
        project_status_gid,
        opts,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register project status list retrieval tool
export function registerGetProjectStatusesForProjectTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    getProjectStatusesForProjectTool.name,
    getProjectStatusesForProjectTool.inputSchema,
    async ({ project_gid, ...opts }) => {
      const response = await asanaClient.getProjectStatusesForProject(
        project_gid,
        opts,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register project status creation tool
export function registerCreateProjectStatusTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    createProjectStatusTool.name,
    createProjectStatusTool.inputSchema,
    async ({ project_gid, ...statusData }) => {
      const response = await asanaClient.createProjectStatus(
        project_gid,
        statusData,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register project status deletion tool
export function registerDeleteProjectStatusTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    deleteProjectStatusTool.name,
    deleteProjectStatusTool.inputSchema,
    async ({ project_status_gid }) => {
      const response = await asanaClient.deleteProjectStatus(
        project_status_gid,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register all project status-related tools
export function registerAllProjectStatusTools(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  registerGetProjectStatusTool(server, asanaClient);
  registerGetProjectStatusesForProjectTool(server, asanaClient);
  registerCreateProjectStatusTool(server, asanaClient);
  registerDeleteProjectStatusTool(server, asanaClient);
}
