import {
  Tool,
  CallToolRequest,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { AsanaClientWrapper } from "./asana-client-wrapper.js";

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

// ツールのハンドラー関数をインポート
import { registerAllWorkspaceTools } from "./tools/workspace-tools.js";
import { registerAllProjectTools } from "./tools/project-tools.js";
import { registerAllProjectStatusTools } from "./tools/project-status-tools.js";
import { registerAllTaskTools } from "./tools/task-tools.js";
import { registerAllTagTools } from "./tools/tag-tools.js";
import { registerAllTaskRelationshipTools } from "./tools/task-relationship-tools.js";
import { registerAllStoryTools } from "./tools/story-tools.js";

// 注: list_of_toolsは現在使用されていないため削除
// 必要に応じて、以下のようにunknownを経由した型アサーションを使用できます
// export const list_of_tools = [
//   listWorkspacesTool,
//   searchProjectsTool,
//   // ...他のツール
// ] as unknown as Tool[];

// ツールハンドラー関数（後方互換性のために残す）
export function tool_handler(
  asanaClient: AsanaClientWrapper,
): (request: CallToolRequest) => Promise<CallToolResult> {
  return async (request: CallToolRequest) => {
    console.error("Received CallToolRequest:", request);
    try {
      if (!request.params.arguments) {
        throw new Error("No arguments provided");
      }

      const args = request.params.arguments as any;

      // 各ツールのハンドラーを呼び出す
      switch (request.params.name) {
        case "asana_list_workspaces": {
          const response = await asanaClient.listWorkspaces(args);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_search_projects": {
          const { workspace, name_pattern, archived = false, ...opts } = args;
          const response = await asanaClient.searchProjects(
            workspace,
            name_pattern,
            archived,
            opts,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_search_tasks": {
          const { workspace, ...searchOpts } = args;
          const response = await asanaClient.searchTasks(workspace, searchOpts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_task": {
          const { task_id, ...opts } = args;
          const response = await asanaClient.getTask(task_id, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_create_task": {
          const { project_id, ...taskData } = args;
          const response = await asanaClient.createTask(project_id, taskData);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_task_stories": {
          const { task_id, ...opts } = args;
          const response = await asanaClient.getStoriesForTask(task_id, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_update_task": {
          const { task_id, ...taskData } = args;
          const response = await asanaClient.updateTask(task_id, taskData);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_project": {
          const { project_id, ...opts } = args;
          const response = await asanaClient.getProject(project_id, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_project_task_counts": {
          const { project_id, ...opts } = args;
          const response = await asanaClient.getProjectTaskCounts(
            project_id,
            opts,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_project_status": {
          const { project_status_gid, ...opts } = args;
          const response = await asanaClient.getProjectStatus(
            project_status_gid,
            opts,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_project_statuses": {
          const { project_gid, ...opts } = args;
          const response = await asanaClient.getProjectStatusesForProject(
            project_gid,
            opts,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_create_project_status": {
          const { project_gid, ...statusData } = args;
          const response = await asanaClient.createProjectStatus(
            project_gid,
            statusData,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_delete_project_status": {
          const { project_status_gid } = args;
          const response = await asanaClient.deleteProjectStatus(
            project_status_gid,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_project_sections": {
          const { project_id, ...opts } = args;
          const response = await asanaClient.getProjectSections(
            project_id,
            opts,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_create_task_story": {
          const { task_id, text, ...opts } = args;
          const response = await asanaClient.createTaskStory(
            task_id,
            text,
            opts,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_add_task_dependencies": {
          const { task_id, dependencies } = args;
          const response = await asanaClient.addTaskDependencies(
            task_id,
            dependencies,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_add_task_dependents": {
          const { task_id, dependents } = args;
          const response = await asanaClient.addTaskDependents(
            task_id,
            dependents,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_create_subtask": {
          const { parent_task_id, opt_fields, ...taskData } = args;
          const response = await asanaClient.createSubtask(
            parent_task_id,
            taskData,
            { opt_fields },
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_multiple_tasks_by_gid": {
          const { task_ids, ...opts } = args;
          // Handle both array and string input
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
        }

        case "asana_set_parent_for_task": {
          let { data, task_id, opts } = args;
          if (typeof data == "string") {
            data = JSON.parse(data);
          }
          if (typeof opts == "string") {
            opts = JSON.parse(opts);
          }
          const response = await asanaClient.setParentForTask(
            data,
            task_id,
            opts,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_tasks_for_tag": {
          const { tag_gid, ...opts } = args;
          const response = await asanaClient.getTasksForTag(tag_gid, opts);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        case "asana_get_tags_for_workspace": {
          const { workspace_gid, ...opts } = args;
          const response = await asanaClient.getTagsForWorkspace(
            workspace_gid,
            opts,
          );
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      console.error("Error executing tool:", error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
            }),
          },
        ],
      };
    }
  };
}

// 新しいMcpServerにすべてのツールを登録する関数
export function registerAllTools(server: any, asanaClient: AsanaClientWrapper) {
  registerAllWorkspaceTools(server, asanaClient);
  registerAllProjectTools(server, asanaClient);
  registerAllProjectStatusTools(server, asanaClient);
  registerAllTaskTools(server, asanaClient);
  registerAllTagTools(server, asanaClient);
  registerAllTaskRelationshipTools(server, asanaClient);
  registerAllStoryTools(server, asanaClient);
}
