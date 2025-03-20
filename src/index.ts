#!/usr/bin/env node
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { VERSION } from "./version.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AsanaClientWrapper } from "./asana-client-wrapper.js";
import { z } from "zod";

// ツールの定義をインポート
import { listWorkspacesTool } from "./tools/workspace-tools.js";
import {
  searchProjectsTool,
  getProjectTool,
  getProjectTaskCountsTool,
  getProjectSectionsTool,
} from "./tools/project-tools.js";
import {
  getProjectStatusTool,
  getProjectStatusesForProjectTool,
  createProjectStatusTool,
  deleteProjectStatusTool,
} from "./tools/project-status-tools.js";
import {
  searchTasksTool,
  getTaskTool,
  createTaskTool,
  updateTaskTool,
  createSubtaskTool,
  getMultipleTasksByGidTool,
} from "./tools/task-tools.js";
import {
  getTasksForTagTool,
  getTagsForWorkspaceTool,
} from "./tools/tag-tools.js";
import {
  addTaskDependenciesTool,
  addTaskDependentsTool,
  setParentForTaskTool,
} from "./tools/task-relationship-tools.js";
import {
  getStoriesForTaskTool,
  createTaskStoryTool,
} from "./tools/story-tools.js";

// プロンプト定義
const PROMPTS = {
  "task-summary": {
    name: "task-summary",
    description:
      "Get a summary and status update for a task based on its notes, custom fields and comments",
    arguments: [
      {
        name: "task_id",
        description: "The task ID to get summary for",
        required: true,
      },
    ],
  },
  "task-completeness": {
    name: "task-completeness",
    description:
      "Analyze if a task description contains all necessary details for completion",
    arguments: [
      {
        name: "task_id",
        description: "The task ID or URL to analyze",
        required: true,
      },
    ],
  },
  "create-task": {
    name: "create-task",
    description: "Create a new task with specified details",
    arguments: [
      {
        name: "project_name",
        description:
          "The name of the Asana project where the task should be created",
        required: true,
      },
      {
        name: "title",
        description: "The title of the task",
        required: true,
      },
      {
        name: "notes",
        description: "Notes or description for the task",
        required: false,
      },
      {
        name: "due_date",
        description: "Due date for the task (YYYY-MM-DD format)",
        required: false,
      },
    ],
  },
};

async function main() {
  const asanaToken = process.env.ASANA_ACCESS_TOKEN;

  if (!asanaToken) {
    console.error("Please set ASANA_ACCESS_TOKEN environment variable");
    process.exit(1);
  }

  console.error("Starting Asana MCP Server...");

  // McpServerを使用して新しいサーバーを作成
  const server = new McpServer({
    name: "Asana MCP Server",
    version: VERSION,
  });

  const asanaClient = new AsanaClientWrapper(asanaToken);

  // ツールの登録
  // asana_list_workspaces
  server.tool(
    "asana_list_workspaces",
    {
      opt_fields: z.string().optional(),
    },
    async (args) => {
      const response = await asanaClient.listWorkspaces(args);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_search_projects
  server.tool(
    "asana_search_projects",
    {
      workspace: z.string(),
      name_pattern: z.string(),
      archived: z.boolean().optional(),
      opt_fields: z.string().optional(),
    },
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

  // asana_search_tasks
  server.tool(
    "asana_search_tasks",
    {
      workspace: z.string(),
      text: z.string().optional(),
      resource_subtype: z.string().optional(),
      completed: z.boolean().optional(),
      sort_by: z.string().optional(),
      sort_ascending: z.boolean().optional(),
      opt_fields: z.string().optional(),
      custom_fields: z.record(z.any()).optional(),
    },
    async ({ workspace, ...searchOpts }) => {
      const response = await asanaClient.searchTasks(workspace, searchOpts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_get_task
  server.tool(
    "asana_get_task",
    {
      task_id: z.string(),
      opt_fields: z.string().optional(),
    },
    async ({ task_id, ...opts }) => {
      const response = await asanaClient.getTask(task_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_create_task
  server.tool(
    "asana_create_task",
    {
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
    async ({ project_id, ...taskData }) => {
      const response = await asanaClient.createTask(project_id, taskData);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_get_task_stories
  server.tool(
    "asana_get_task_stories",
    {
      task_id: z.string(),
      opt_fields: z.string().optional(),
    },
    async ({ task_id, ...opts }) => {
      const response = await asanaClient.getStoriesForTask(task_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_update_task
  server.tool(
    "asana_update_task",
    {
      task_id: z.string(),
      name: z.string().optional(),
      notes: z.string().optional(),
      due_on: z.string().optional(),
      assignee: z.string().optional(),
      completed: z.boolean().optional(),
    },
    async ({ task_id, ...taskData }) => {
      const response = await asanaClient.updateTask(task_id, taskData);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_get_project
  server.tool(
    "asana_get_project",
    {
      project_id: z.string(),
      opt_fields: z.string().optional(),
    },
    async ({ project_id, ...opts }) => {
      const response = await asanaClient.getProject(project_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_get_project_task_counts
  server.tool(
    "asana_get_project_task_counts",
    {
      project_id: z.string(),
      opt_fields: z.string().optional(),
    },
    async ({ project_id, ...opts }) => {
      const response = await asanaClient.getProjectTaskCounts(project_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_get_project_sections
  server.tool(
    "asana_get_project_sections",
    {
      project_id: z.string(),
      opt_fields: z.string().optional(),
    },
    async ({ project_id, ...opts }) => {
      const response = await asanaClient.getProjectSections(project_id, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_create_task_story
  server.tool(
    "asana_create_task_story",
    {
      task_id: z.string(),
      text: z.string(),
      opt_fields: z.string().optional(),
    },
    async ({ task_id, text, ...opts }) => {
      const response = await asanaClient.createTaskStory(task_id, text, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_add_task_dependencies
  server.tool(
    "asana_add_task_dependencies",
    {
      task_id: z.string(),
      dependencies: z.array(z.string()),
    },
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

  // asana_add_task_dependents
  server.tool(
    "asana_add_task_dependents",
    {
      task_id: z.string(),
      dependents: z.array(z.string()),
    },
    async ({ task_id, dependents }) => {
      const response = await asanaClient.addTaskDependents(task_id, dependents);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_create_subtask
  server.tool(
    "asana_create_subtask",
    {
      parent_task_id: z.string(),
      name: z.string(),
      notes: z.string().optional(),
      due_on: z.string().optional(),
      assignee: z.string().optional(),
      opt_fields: z.string().optional(),
    },
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

  // asana_get_multiple_tasks_by_gid
  server.tool(
    "asana_get_multiple_tasks_by_gid",
    {
      task_ids: z.union([z.array(z.string()), z.string()]),
      opt_fields: z.string().optional(),
    },
    async ({ task_ids, ...opts }) => {
      // 配列とカンマ区切り文字列の両方を処理
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

  // asana_get_project_status
  server.tool(
    "asana_get_project_status",
    {
      project_status_gid: z.string(),
      opt_fields: z.string().optional(),
    },
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

  // asana_get_project_statuses
  server.tool(
    "asana_get_project_statuses",
    {
      project_gid: z.string(),
      limit: z.number().optional(),
      offset: z.string().optional(),
      opt_fields: z.string().optional(),
    },
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

  // asana_create_project_status
  server.tool(
    "asana_create_project_status",
    {
      project_gid: z.string(),
      text: z.string(),
      color: z.enum(["green", "yellow", "red"]).optional(),
      title: z.string().optional(),
      html_text: z.string().optional(),
      opt_fields: z.string().optional(),
    },
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

  // asana_delete_project_status
  server.tool(
    "asana_delete_project_status",
    {
      project_status_gid: z.string(),
    },
    async ({ project_status_gid }) => {
      const response = await asanaClient.deleteProjectStatus(
        project_status_gid,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_set_parent_for_task
  server.tool(
    "asana_set_parent_for_task",
    {
      data: z.union([z.string(), z.record(z.any())]),
      task_id: z.string(),
      opts: z.union([z.string(), z.record(z.any())]).optional(),
    },
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

  // asana_get_tasks_for_tag
  server.tool(
    "asana_get_tasks_for_tag",
    {
      tag_gid: z.string(),
      opt_fields: z.string().optional(),
    },
    async ({ tag_gid, ...opts }) => {
      const response = await asanaClient.getTasksForTag(tag_gid, opts);
      return {
        content: [{ type: "text", text: JSON.stringify(response) }],
      };
    },
  );

  // asana_get_tags_for_workspace
  server.tool(
    "asana_get_tags_for_workspace",
    {
      workspace_gid: z.string(),
      opt_fields: z.string().optional(),
    },
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

  // プロンプトの登録
  // task-summary プロンプト
  server.prompt(
    "task-summary",
    {
      task_id: z.string(),
    },
    async ({ task_id }) => {
      // タスクの詳細を取得
      const task = await asanaClient.getTask(task_id, {
        opt_fields:
          "name,notes,custom_fields,custom_fields.name,custom_fields.display_value",
      });

      // コメント/ストーリーを取得
      const stories = await asanaClient.getStoriesForTask(task_id, {
        opt_fields: "text,created_at,created_by",
      });

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please provide a summary and status update for this task based on the following information:

Task Name: ${task.name}

Task Notes:
${task.notes || "No notes"}

Custom Fields:
${
  task.custom_fields
    ?.map(
      (field: { name: string; display_value: string }) =>
        `${field.name}: ${field.display_value}`,
    )
    .join("\n") || "No custom fields"
}

Comments/Updates (from newest to oldest):
${
  stories
    .map(
      (story: { created_at: string; text: string }) =>
        `[${new Date(story.created_at).toLocaleString()}] ${story.text}`,
    )
    .join("\n\n") || "No comments"
}

Please include:
1. Current status and progress
2. Key updates or decisions
3. Any blockers or dependencies
4. Next steps or pending actions`,
            },
          },
        ],
      };
    },
  );

  // task-completeness プロンプト
  server.prompt(
    "task-completeness",
    {
      task_id: z.string(),
    },
    async ({ task_id }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I'll provide you with the ID or URL of an Asana task.
Your job is to fetch the task details using the asana tools and conduct a
horough analysis of the task description and help transform it into a
comprehensive, actionable set of instructions.

Task Analysis Process:
1. First, retrieve and examine the complete task details using the ID (extract if from url if it's a url) provided
2. Systematically evaluate if the task contains ALL essential components:
   • Clear, specific objective with defined scope
   • Detailed deliverables with acceptance criteria
   • Technical requirements and specifications (when appropriate)
   • Design/UX guidelines or references (when appropriate)
   • Required resources, tools, and access needs
   • Dependencies on other tasks or team members (when appropriate)
   • Timeline details (deadlines, milestones, priority level)
   • Success criteria and testing/validation methods
   • Stakeholder approval process (when appropriate)
   • Communication expectations (when appropriate)

3. Identify any information gaps that would prevent the assignee from:
   • Understanding exactly what needs to be done
   • Knowing how to approach the task correctly
   • Determining when the task is successfully completed
   • Accessing necessary resources or inputs
   • Coordinating with other team members

4. Ask targeted, specific questions to fill these gaps, focusing on the most critical missing elements first

5. Once you have gathered the additional information:
   • Update the task description by integrating the new details seamlessly with the existing content
   • Organize the information logically with clear section headings
   • Highlight any critical requirements or constraints
   • Add a checklist of subtasks if appropriate
   * Do not remove anything from the original description unless officially requested.

The end result should be a task description so clear and complete that anyone with the
appropriate skills could execute it successfully without needing to ask for clarification.

Task: ${task_id}
`,
            },
          },
        ],
      };
    },
  );

  // create-task プロンプト
  server.prompt(
    "create-task",
    {
      project_name: z.string(),
      title: z.string(),
      notes: z.string().optional(),
      due_date: z.string().optional(),
    },
    async ({ project_name, title, notes, due_date }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `# Comprehensive Asana Task Creator

You are a strategic task management specialist with expertise in creating clear, actionable Asana tasks that drive successful project outcomes. Your role is to guide the user through crafting thorough task descriptions that leave no room for ambiguity, ensuring task assignees have complete clarity on expectations, requirements, and success criteria.

## Task Discovery Process

### Initial Assessment
- Identify the task type (technical implementation, creative design, research, communication, etc.)
- Understand where this task fits within the broader project/initiative
- Determine the primary stakeholders and their specific needs

### Core Information Collection
1. **Task Overview:**
   - What is the primary objective of this task?
   - How does this task contribute to broader project goals?
   - What specific problem is this task solving?
   - What is the business justification or motivation behind this task?

2. **Scope Definition:**
   - What specific deliverables are expected from this task?
   - What is explicitly included in this task's scope?
   - What is explicitly excluded from this task's scope?
   - Are there any dependencies that must be completed before this task begins?
   - Will this task create dependencies for other tasks?

3. **Technical Requirements:** (For technical tasks)
   - Which systems, platforms, or technologies will this task involve?
   - Are there specific technical constraints or requirements to consider?
   - What technical documentation or resources are available to support the task?
   - Are there security considerations, performance requirements, or compatibility issues?
   - What testing criteria should be applied to verify technical implementation?

4. **Design/UX Specifications:** (For design/UX tasks)
   - What user experience goals must be achieved?
   - Are there brand guidelines, style guides, or design systems to follow?
   - What specific user flows or interactions need to be addressed?
   - Are there accessibility requirements to consider?
   - What user feedback or research should inform this design work?

5. **Resource Requirements:**
   - What skills or expertise are needed to complete this task?
   - What tools, software, or accounts will the assignee need access to?
   - Is collaboration with specific team members or departments required?
   - Are there budget considerations or approvals needed?

6. **Timeline and Prioritization:**
   - When does this task need to be completed?
   - Are there interim milestones or check-in points?
   - How should this task be prioritized relative to other work?
   - Is this a blocking task for other team members?

7. **Success Criteria:**
   - How will you determine if this task has been completed successfully?
   - What specific metrics or outcomes will be used to measure success?
   - What review process will be used to evaluate the deliverables?
   - Who needs to approve the completed work?

8. **Communication Plan:**
   - Who should receive updates on task progress?
   - What is the preferred method and frequency of status updates?
   - Who should be consulted if questions or issues arise?
   - Are there any stakeholders who need special communication handling?

### Documentation Elements
- Reference materials, links, or attachments needed
- Screenshots or visual references
- Contact information for subject matter experts
- Examples of similar completed tasks
- Templates or starter files

## Task Creation Framework

Based on the collected information, I'll help you structure your Asana task with:

1. **Clear, action-oriented task title** that immediately communicates purpose
2. **Concise summary** of the task's objective and importance
3. **Detailed description** with all relevant specifications and requirements
4. **Task checklist** breaking down complex tasks into manageable steps
5. **Custom fields** for tracking important metrics or attributes
6. **Due date and time estimate** that accurately reflects effort required
7. **Proper task assignments** to individuals or teams
8. **Relevant tags** for easy filtering and reporting
9. **Task relationships** (dependencies, subtasks, related tasks)
10. **Attachments and references** providing necessary context and resources

Throughout our conversation, I'll ask targeted questions to ensure we capture all necessary details, helping you create a comprehensive Asana task that enables successful execution and minimizes back-and-forth clarification.

Here's some details to get started:
Project Name: ${project_name} (confirm the name is right by searching it)
Task Title: ${title}
${notes ? `Notes/Description: ${notes}` : ""}
${due_date ? `Due Date: ${due_date}` : ""}
`,
            },
          },
        ],
      };
    },
  );

  // リソースの登録
  // ワークスペースリソース
  server.resource(
    "workspace",
    new ResourceTemplate("asana://workspace/{workspace_gid}", {
      list: undefined,
    }),
    async (uri, params) => {
      const workspace_gid = params.workspace_gid as string;
      // ワークスペースの詳細を取得
      const workspaces = await asanaClient.listWorkspaces({
        opt_fields: "name,gid,resource_type,email_domains,is_organization",
      });

      const workspace = workspaces.find((ws: any) => ws.gid === workspace_gid);

      if (!workspace) {
        throw new Error(`Workspace not found: ${workspace_gid}`);
      }

      // ワークスペースデータのフォーマット
      const workspaceData = {
        name: workspace.name,
        id: workspace.gid,
        type: workspace.resource_type,
        is_organization: workspace.is_organization,
        email_domains: workspace.email_domains,
      };

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(workspaceData, null, 2),
          },
        ],
      };
    },
  );

  // プロジェクトリソース
  server.resource(
    "project",
    new ResourceTemplate("asana://project/{project_gid}", { list: undefined }),
    async (uri, params) => {
      const project_gid = params.project_gid as string;
      try {
        // プロジェクトの詳細を取得
        const project = await asanaClient.getProject(project_gid, {
          opt_fields:
            "name,gid,resource_type,created_at,modified_at,archived,public,notes,color,default_view,due_date,due_on,start_on,workspace,team",
        });

        if (!project) {
          throw new Error(`Project not found: ${project_gid}`);
        }

        // プロジェクトのセクションを取得
        let sections = [];
        try {
          sections = await asanaClient.getProjectSections(project_gid, {
            opt_fields: "name,gid,created_at",
          });
        } catch (sectionError) {
          console.error(
            `Error fetching sections for project ${project_gid}:`,
            sectionError,
          );
          // 空のセクション配列で続行
        }

        // カスタムフィールド設定を直接取得
        let customFields = [];
        try {
          const customFieldSettings =
            await asanaClient.getProjectCustomFieldSettings(project_gid, {
              opt_fields:
                "custom_field.name,custom_field.gid,custom_field.resource_type,custom_field.type,custom_field.description,custom_field.enum_options,custom_field.enum_options.gid,custom_field.enum_options.name,custom_field.enum_options.enabled,custom_field.precision,custom_field.format",
            });

          if (customFieldSettings && Array.isArray(customFieldSettings)) {
            customFields = customFieldSettings
              .filter((setting: any) => setting && setting.custom_field)
              .map((setting: any) => {
                const field = setting.custom_field;
                let fieldData: any = {
                  gid: field.gid || null,
                  name: field.name || null,
                  type: field.resource_type || null,
                  field_type: field.type || null,
                  description: field.description || null,
                };

                // フィールドタイプ固有のプロパティを追加
                switch (field.type) {
                  case "enum":
                    if (
                      field.enum_options &&
                      Array.isArray(field.enum_options)
                    ) {
                      fieldData.enum_options = field.enum_options
                        .filter((option: any) => option.enabled !== false)
                        .map((option: any) => ({
                          gid: option.gid || null,
                          name: option.name || null,
                        }));
                    }
                    break;
                  case "multi_enum":
                    if (
                      field.enum_options &&
                      Array.isArray(field.enum_options)
                    ) {
                      fieldData.enum_options = field.enum_options
                        .filter((option: any) => option.enabled !== false)
                        .map((option: any) => ({
                          gid: option.gid || null,
                          name: option.name || null,
                        }));
                    }
                    break;
                  case "number":
                    fieldData.precision = field.precision || 0;
                    break;
                  case "text":
                  case "date":
                    // 特別な処理は不要
                    break;
                  case "people":
                    // 特別な処理は不要
                    break;
                }

                return fieldData;
              });
          }
        } catch (customFieldError) {
          console.error(
            `Error fetching custom fields for project ${project_gid}:`,
            customFieldError,
          );
          // 空のcustomFields配列で続行
        }

        // プロジェクトデータのフォーマット
        const projectData = {
          name: project.name || null,
          id: project.gid || null,
          type: project.resource_type || null,
          created_at: project.created_at || null,
          modified_at: project.modified_at || null,
          archived: project.archived || false,
          public: project.public || false,
          notes: project.notes || null,
          color: project.color || null,
          default_view: project.default_view || null,
          due_date: project.due_date || null,
          due_on: project.due_on || null,
          start_on: project.start_on || null,
          workspace: project.workspace
            ? {
                gid: project.workspace.gid || null,
                name: project.workspace.name || null,
              }
            : null,
          team: project.team
            ? {
                gid: project.team.gid || null,
                name: project.team.name || null,
              }
            : null,
          sections: sections
            ? sections.map((section: any) => ({
                gid: section.gid || null,
                name: section.name || null,
                created_at: section.created_at || null,
              }))
            : [],
          custom_fields: customFields || [],
        };

        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify(projectData, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error(`Error reading project ${project_gid}:`, error);
        throw new Error(
          `Failed to read project: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    },
  );

  // サーバーをトランスポートに接続
  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("Asana MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
