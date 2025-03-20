#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { VERSION } from "./version.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AsanaClientWrapper } from "./asana-client-wrapper.js";

// Import tools
import { registerAllWorkspaceTools } from "./tools/workspace-tools.js";
import { registerAllProjectTools } from "./tools/project-tools.js";
import { registerAllProjectStatusTools } from "./tools/project-status-tools.js";
import { registerAllTaskTools } from "./tools/task-tools.js";
import { registerAllTagTools } from "./tools/tag-tools.js";
import { registerAllTaskRelationshipTools } from "./tools/task-relationship-tools.js";
import { registerAllStoryTools } from "./tools/story-tools.js";

// Import prompt and resource handlers
import { registerPrompts } from "./prompt-handler.js";
import { registerResources } from "./resource-handler.js";

async function main() {
  const asanaToken = process.env.ASANA_ACCESS_TOKEN;

  if (!asanaToken) {
    console.error("Please set ASANA_ACCESS_TOKEN environment variable");
    process.exit(1);
  }

  console.error("Starting Asana MCP Server...");

  // Create a new server using McpServer
  const server = new McpServer({
    name: "Asana MCP Server",
    version: VERSION,
  });

  const asanaClient = new AsanaClientWrapper(asanaToken);

  // Register tools for each category
  registerAllWorkspaceTools(server, asanaClient);
  registerAllProjectTools(server, asanaClient);
  registerAllProjectStatusTools(server, asanaClient);
  registerAllTaskTools(server, asanaClient);
  registerAllTagTools(server, asanaClient);
  registerAllTaskRelationshipTools(server, asanaClient);
  registerAllStoryTools(server, asanaClient);

  // Register prompts
  registerPrompts(server, asanaClient);

  // Register resources
  registerResources(server, asanaClient);

  // Connect server to transport
  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);

  console.error("Asana MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
