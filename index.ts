#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { OpenAPI } from './src/api/client/index.js';
import * as Tools from './src/tools/index.js';
import type { ToolKeys } from './src/schemas.js';
import * as Handlers from './src/handlers/index.js';
import { validateOrganization } from './src/middleware/validation.js';

// Check for API key
const CODACY_ACCOUNT_TOKEN = process.env.CODACY_ACCOUNT_TOKEN;

OpenAPI.BASE = 'https://app.codacy.com/api/v3';
OpenAPI.HEADERS = {
  'api-token': CODACY_ACCOUNT_TOKEN || '',
  'X-Codacy-Origin': 'mcp-server',
};

const server = new Server(
  {
    name: 'codacy-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      triggers: {
        patterns: [
          'codacy',
          'code quality',
          'code analysis',
          'security vulnerabilities',
          'repository issues',
          'pull request analysis',
          'code coverage',
          'issues',
          'security',
          'srm',
          'analysis',
          'tool',
          'pattern',
          'pull request',
          'repository',
          'file',
          'coverage',
          'git',
          'diff',
          'branch',
          'commit',
          'severity',
          'organization',
        ],
      },
    },
  }
);

interface ToolDefinition {
  tool: Tool;
  handler: (args: any) => Promise<any>;
  requiresAuth?: boolean;
}

const toolDefinitions: { [key in ToolKeys]: ToolDefinition } = {
  codacy_list_organization_repositories: {
    tool: Tools.listOrganizationRepositoriesTool,
    handler: Handlers.listOrganizationRepositoriesHandler,
    requiresAuth: true,
  },
  codacy_search_organization_srm_items: {
    tool: Tools.searchOrganizationSecurityItemsTool,
    handler: Handlers.searchSecurityItemsHandler,
    requiresAuth: true,
  },
  codacy_search_repository_srm_items: {
    tool: Tools.searchRepositorySecurityItemsTool,
    handler: Handlers.searchRepositorySecurityItemsHandler,
    requiresAuth: true,
  },
  codacy_list_repository_issues: {
    tool: Tools.searchRepositoryIssuesTool,
    handler: Handlers.searchRepositoryIssuesHandler,
    requiresAuth: true,
  },
  codacy_list_repository_pull_requests: {
    tool: Tools.listRepositoryPullRequestsTool,
    handler: Handlers.listRepositoryPullRequestsHandler,
    requiresAuth: true,
  },
  codacy_list_files: {
    tool: Tools.listFilesTool,
    handler: Handlers.listFilesHandler,
    requiresAuth: true,
  },
  codacy_get_file_issues: {
    tool: Tools.listFileIssuesTool,
    handler: Handlers.getFileIssuesHandler,
    requiresAuth: true,
  },
  codacy_get_file_coverage: {
    tool: Tools.getFileCoverageTool,
    handler: Handlers.getFileCoverageHandler,
    requiresAuth: true,
  },
  codacy_get_pull_request_files_coverage: {
    tool: Tools.getRepositoryPullRequestFilesCoverageTool,
    handler: Handlers.getRepositoryPullRequestFilesCoverageHandler,
    requiresAuth: true,
  },
  codacy_get_pull_request_git_diff: {
    tool: Tools.getPullRequestGitDiffTool,
    handler: Handlers.getPullRequestGitDiffHandler,
    requiresAuth: true,
  },
  codacy_list_pull_request_issues: {
    tool: Tools.listPullRequestIssuesTool,
    handler: Handlers.listPullRequestIssuesHandler,
    requiresAuth: true,
  },
  codacy_get_repository_with_analysis: {
    tool: Tools.getRepositoryWithAnalysisTool,
    handler: Handlers.getRepositoryWithAnalysisHandler,
    requiresAuth: true,
  },
  codacy_get_file_with_analysis: {
    tool: Tools.getFileWithAnalysisTool,
    handler: Handlers.getFileWithAnalysisHandler,
    requiresAuth: true,
  },
  codacy_get_file_clones: {
    tool: Tools.getFileClonesTool,
    handler: Handlers.getFileClonesHandler,
    requiresAuth: true,
  },
  codacy_get_repository_pull_request: {
    tool: Tools.getRepositoryPullRequestTool,
    handler: Handlers.getRepositoryPullRequestHandler,
    requiresAuth: true,
  },
  codacy_get_issue: {
    tool: Tools.getIssueTool,
    handler: Handlers.getIssueHandler,
    requiresAuth: true,
  },
  codacy_get_pattern: {
    tool: Tools.getPatternTool,
    handler: Handlers.getPatternHandler,
    requiresAuth: false,
  },
  codacy_list_repository_tool_patterns: {
    tool: Tools.listRepositoryToolPatternsTool,
    handler: Handlers.listRepositoryToolPatternsHandler,
    requiresAuth: true,
  },
  codacy_list_tools: {
    tool: Tools.listToolsTool,
    handler: Handlers.listToolsHandler,
    requiresAuth: false,
  },
  codacy_list_repository_tools: {
    tool: Tools.listRepositoryToolsTool,
    handler: Handlers.listRepositoryToolsHandler,
    requiresAuth: true,
  },
  codacy_list_organizations: {
    tool: Tools.listOrganizationsTool,
    handler: Handlers.listOrganizationsHandler,
    requiresAuth: true,
  },
  codacy_cli_analyze: {
    tool: Tools.cliAnalyzeTool,
    handler: Handlers.cliAnalyzeHandler,
    requiresAuth: false,
  },
  codacy_setup_repository: {
    tool: Tools.setupRepositoryTool,
    handler: Handlers.setupRepositoryHandler,
    requiresAuth: true,
  },
};

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.values(toolDefinitions)
    .filter(({ requiresAuth }) => CODACY_ACCOUNT_TOKEN || !requiresAuth)
    .map(({ tool }) => tool),
}));

// Register request handlers
server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    if (!request.params.arguments) {
      throw new Error('Arguments are required');
    }

    const toolDefinition = toolDefinitions[request.params.name as ToolKeys];
    if (!toolDefinition) throw new Error(`Unknown tool: ${request.params.name}`);

    // Validate organization if the tool requires it
    if (request.params.arguments.organization) {
      request.params.arguments = validateOrganization(request.params.arguments);
    }

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
