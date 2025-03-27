#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
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

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      listOrganizationRepositoriesTool,
      searchRepositoryIssuesTool,
      listFilesTool,
      listFileIssuesTool,
      getFileCoverageTool,
      searchSecurityItemsTool,
      listRepositoryPullRequestsTool,
      listPullRequestIssuesTool,
      getRepositoryPullRequestFilesCoverageTool,
      getPullRequestGitDiffTool,
    ],
  };
});

// Register request handlers
server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    if (!request.params.arguments) {
      throw new Error('Arguments are required');
    }

    switch (request.params.name) {
      case 'codacy_list_repositories': {
        const result = await listOrganizationRepositoriesHandler(request.params.arguments);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'codacy_list_files': {
        const result = await listFilesHandler(request.params.arguments);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'codacy_get_file_issues': {
        const result = await getFileIssuesHandler(request.params.arguments);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'codacy_get_file_coverage': {
        const result = await getFileCoverageHandler(request.params.arguments);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'codacy_list_repository_issues': {
        const result = await searchRepositoryIssuesHandler(request.params.arguments);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'codacy_list_repository_pull_requests': {
        const result = await listRepositoryPullRequestsHandler(request.params.arguments);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'codacy_list_srm_items': {
        const result = await searchSecurityItemsHandler(request.params.arguments);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'codacy_list_pull_request_issues': {
        const result = await listPullRequestIssuesHandler(request.params.arguments);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'codacy_get_repository_pull_request_files_coverage': {
        const result = await getRepositoryPullRequestFilesCoverageHandler(request.params.arguments);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }
      case 'codacy_get_pull_request_git_diff': {
        const result = await getPullRequestGitDiffHandler(request.params.arguments);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
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
  console.error('Codacy MCP Server running on stdio');
}

runServer().catch(error => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
