import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AsanaClientWrapper } from "../asana-client-wrapper.js";

// Project search tool
export const searchProjectsTool = {
  name: "asana_search_projects",
  description: "Search for projects in Asana using name pattern matching",
  inputSchema: {
    workspace: z.string(),
    name_pattern: z.string(),
    archived: z.boolean().optional(),
    opt_fields: z.string().optional(),
  },
};

// Project retrieval tool
export const getProjectTool = {
  name: "asana_get_project",
  description: "Get detailed information about a specific project",
  inputSchema: {
    project_id: z.string(),
    opt_fields: z.string().optional(),
  },
};

// Project task count retrieval tool
export const getProjectTaskCountsTool = {
  name: "asana_get_project_task_counts",
  description: "Get the number of tasks in a project",
  inputSchema: {
    project_id: z.string(),
    opt_fields: z.string().optional(),
  },
};

// Project section retrieval tool
export const getProjectSectionsTool = {
  name: "asana_get_project_sections",
  description: "Get sections in a project",
  inputSchema: {
    project_id: z.string(),
    opt_fields: z.string().optional(),
  },
};

// Register project search tool
export function registerSearchProjectsTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    searchProjectsTool.name,
    searchProjectsTool.inputSchema,
    async ({ workspace, name_pattern, archived = false, ...opts }) => {
      const response = await asanaClient.searchProjects(
        workspace,
        name_pattern,
        archived,
        opts,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register project retrieval tool
export function registerGetProjectTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    getProjectTool.name,
    getProjectTool.inputSchema,
    async ({ project_id, ...opts }) => {
      const response = await asanaClient.getProject(project_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register project task count retrieval tool
export function registerGetProjectTaskCountsTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    getProjectTaskCountsTool.name,
    getProjectTaskCountsTool.inputSchema,
    async ({ project_id, ...opts }) => {
      const response = await asanaClient.getProjectTaskCounts(project_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register project section retrieval tool
export function registerGetProjectSectionsTool(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  server.tool(
    getProjectSectionsTool.name,
    getProjectSectionsTool.inputSchema,
    async ({ project_id, ...opts }) => {
      const response = await asanaClient.getProjectSections(project_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );
}

// Register all project-related tools
export function registerAllProjectTools(
  server: McpServer,
  asanaClient: AsanaClientWrapper,
) {
  registerSearchProjectsTool(server, asanaClient);
  registerGetProjectTool(server, asanaClient);
  registerGetProjectTaskCountsTool(server, asanaClient);
  registerGetProjectSectionsTool(server, asanaClient);
}
