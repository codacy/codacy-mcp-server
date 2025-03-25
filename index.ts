#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { OpenAPI, OrganizationService } from "./src/api/client/index.js";

OpenAPI.BASE = "https://app.codacy.com/api/v3";
OpenAPI.HEADERS = {
  "api-token": process.env.CODACY_ACCOUNT_TOKEN || "",
};

const server = new Server(
  {
    name: "codacy-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const listOrganizationRepositoriesTool: Tool = {
  name: "codacy_list_repositories",
  description: "List repositories in an organization with pagination",
  inputSchema: {
    type: "object",
    properties: {
      provider: {
        type: "string",
        description:
          "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb.",
      },
      organization: {
        type: "string",
        description: "Organization name",
      },
      cursor: {
        type: "string",
        description: "Pagination cursor for next page of results",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of results to return (default 100, max 100)",
        default: 100,
      },
    },
  },
};

const listOrganizationRepositoriesHandler = async (args: any) => {
  const { provider, organization, limit, cursor } = args;

  return await OrganizationService.listOrganizationRepositories(
    provider,
    organization,
    cursor,
    limit
  );
};

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [listOrganizationRepositoriesTool],
  };
});

// Register request handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "codacy_list_repositories": {
        const result = await listOrganizationRepositoriesHandler(
          request.params.arguments
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Codacy MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
