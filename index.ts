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
import type { ToolKeys } from './src/tools/index.js';
import * as Handlers from './src/handlers/index.js';
import { validateOrganization } from './src/middleware/validation.js';

OpenAPI.BASE = 'https://app.codacy.com/api/v3';
OpenAPI.HEADERS = {
  'api-token': process.env.CODACY_ACCOUNT_TOKEN || '',
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
}

const toolDefinitions: { [key in ToolKeys]: ToolDefinition } = {
  codacy_list_organization_repositories: {
    tool: Tools.listOrganizationRepositoriesTool,
    handler: Handlers.listOrganizationRepositoriesHandler,
  },
  codacy_list_srm_items: {
    tool: Tools.searchSecurityItemsTool,
    handler: Handlers.searchSecurityItemsHandler,
  },
  codacy_list_repository_issues: {
    tool: Tools.searchRepositoryIssuesTool,
    handler: Handlers.searchRepositoryIssuesHandler,
  },
  codacy_list_repository_pull_requests: {
    tool: Tools.listRepositoryPullRequestsTool,
    handler: Handlers.listRepositoryPullRequestsHandler,
  },
  codacy_list_files: { tool: Tools.listFilesTool, handler: Handlers.listFilesHandler },
  codacy_get_file_issues: {
    tool: Tools.listFileIssuesTool,
    handler: Handlers.getFileIssuesHandler,
  },
  codacy_get_file_coverage: {
    tool: Tools.getFileCoverageTool,
    handler: Handlers.getFileCoverageHandler,
  },
  codacy_get_repository_pull_request_files_coverage: {
    tool: Tools.getRepositoryPullRequestFilesCoverageTool,
    handler: Handlers.getRepositoryPullRequestFilesCoverageHandler,
  },
  codacy_get_pull_request_git_diff: {
    tool: Tools.getPullRequestGitDiffTool,
    handler: Handlers.getPullRequestGitDiffHandler,
  },
  codacy_list_pull_request_issues: {
    tool: Tools.listPullRequestIssuesTool,
    handler: Handlers.listPullRequestIssuesHandler,
  },
  codacy_get_repository_with_analysis: {
    tool: Tools.getRepositoryWithAnalysisTool,
    handler: Handlers.getRepositoryWithAnalysisHandler,
  },
  codacy_get_file_with_analysis: {
    tool: Tools.getFileWithAnalysisTool,
    handler: Handlers.getFileWithAnalysisHandler,
  },
  codacy_get_repository_pull_request: {
    tool: Tools.getRepositoryPullRequestTool,
    handler: Handlers.getRepositoryPullRequestHandler,
  },
  codacy_get_issue: {
    tool: Tools.getIssueTool,
    handler: Handlers.getIssueHandler,
  },
  codacy_get_pattern: {
    tool: Tools.getPatternTool,
    handler: Handlers.getPatternHandler,
  },
  codacy_list_repository_tool_patterns: {
    tool: Tools.listRepositoryToolPatternsTool,
    handler: Handlers.listRepositoryToolPatternsHandler,
  },
  codacy_list_tools: {
    tool: Tools.listToolsTool,
    handler: Handlers.listToolsHandler,
  },
  codacy_list_repository_tools: {
    tool: Tools.listRepositoryToolsTool,
    handler: Handlers.listRepositoryToolsHandler,
  },
  codacy_list_organization: {
    tool: Tools.listOrganizationsTool,
    handler: Handlers.listOrganizationsHandler,
  },
  codacy_cli_install: {
    tool: Tools.cliInstallTool,
    handler: Handlers.cliInstallHandler,
  },
  codacy_cli_analyze: {
    tool: Tools.cliAnalyseTool,
    handler: Handlers.cliAnalyseHandler,
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
