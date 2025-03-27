#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { OpenAPI } from './src/api/client/index.js';
import {
  getFileCoverageTool,
  listFileIssuesTool,
  getPullRequestGitDiffTool,
  getRepositoryPullRequestFilesCoverageTool,
  listFilesTool,
  listOrganizationRepositoriesTool,
  listPullRequestIssuesTool,
  listRepositoryPullRequestsTool,
  searchRepositoryIssuesTool,
  searchSecurityItemsTool,
} from './src/tools/index.js';
import {
  getFileCoverageHandler,
  getFileIssuesHandler,
  getPullRequestGitDiffHandler,
  getRepositoryPullRequestFilesCoverageHandler,
  listFilesHandler,
  listPullRequestIssuesHandler,
  listRepositoryPullRequestsHandler,
  searchRepositoryIssuesHandler,
  searchSecurityItemsHandler,
  listOrganizationRepositoriesHandler,
} from './src/handlers/index.js';

OpenAPI.BASE = 'https://app.codacy.com/api/v3';
OpenAPI.HEADERS = {
  'api-token': process.env.CODACY_ACCOUNT_TOKEN || '',
};

const server = new Server(
  {
    name: 'codacy-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

type toolKeys =
  | 'codacy_list_organization_repositories'
  | 'codacy_list_srm_items'
  | 'codacy_list_repository_issues'
  | 'codacy_list_repository_pull_requests'
  | 'codacy_list_files'
  | 'codacy_get_file_issues'
  | 'codacy_get_file_coverage'
  | 'codacy_get_repository_pull_request_files_coverage'
  | 'codacy_get_pull_request_git_diff'
  | 'codacy_list_pull_request_issues';

interface ToolDefinition {
  tool: Tool;
  handler: (args: any) => Promise<any>;
}

const toolDefinitions: { [key in toolKeys]: ToolDefinition } = {
  codacy_list_organization_repositories: {
    tool: listOrganizationRepositoriesTool,
    handler: listOrganizationRepositoriesHandler,
  },
  codacy_list_srm_items: { tool: searchSecurityItemsTool, handler: searchSecurityItemsHandler },
  codacy_list_repository_issues: {
    tool: searchRepositoryIssuesTool,
    handler: searchRepositoryIssuesHandler,
  },
  codacy_list_repository_pull_requests: {
    tool: listRepositoryPullRequestsTool,
    handler: listRepositoryPullRequestsHandler,
  },
  codacy_list_files: { tool: listFilesTool, handler: listFilesHandler },
  codacy_get_file_issues: { tool: listFileIssuesTool, handler: getFileIssuesHandler },
  codacy_get_file_coverage: { tool: getFileCoverageTool, handler: getFileCoverageHandler },
  codacy_get_repository_pull_request_files_coverage: {
    tool: getRepositoryPullRequestFilesCoverageTool,
    handler: getRepositoryPullRequestFilesCoverageHandler,
  },
  codacy_get_pull_request_git_diff: {
    tool: getPullRequestGitDiffTool,
    handler: getPullRequestGitDiffHandler,
  },
  codacy_list_pull_request_issues: {
    tool: listPullRequestIssuesTool,
    handler: listPullRequestIssuesHandler,
  },
};

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.values(toolDefinitions).map(({ tool }) => tool),
}));

// Register request handlers
server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    if (!request.params.arguments) {
      throw new Error('Arguments are required');
    }

    const toolDefinition = toolDefinitions[request.params.name as toolKeys];

    if (!toolDefinition) throw new Error(`Unknown tool: ${request.params.name}`);

    const result = await toolDefinition.handler(request.params.arguments);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Codacy MCP Server running on stdio');
}

runServer().catch(error => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
