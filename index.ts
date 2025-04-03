#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
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
  getRepositoryWithAnalysisTool,
  getFileWithAnalysisTool,
  listRepositoryToolsTool,
  listToolsTool,
  listRepositoryToolPatternsTool,
  getPatternTool,
  getIssueTool,
  getRepositoryPullRequestTool,
  listOrganizationsTool,
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
  getRepositoryWithAnalysisHandler,
  getFileWithAnalysisHandler,
  getRepositoryPullRequestHandler,
  getIssueHandler,
  listRepositoryToolPatternsHandler,
  listRepositoryToolsHandler,
  listToolsHandler,
  getPatternHandler,
  listOrganizationsHandler,
} from './src/handlers/index.js';
import { validateOrganization } from './src/middleware/validation.js';
import { resourceTemplates } from './src/resources/resourceTemplates.js';
import { parseUri } from './src/utils.js';

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

type toolKeys =
  | 'codacy_list_organization_repositories'
  | 'codacy_list_srm_items'
  | 'codacy_list_repository_issues'
  | 'codacy_list_repository_pull_requests'
  | 'codacy_list_files'
  | 'codacy_list_repository_tool_patterns'
  | 'codacy_list_repository_tools'
  | 'codacy_list_tools'
  | 'codacy_list_organization'
  | 'codacy_get_file_issues'
  | 'codacy_get_file_coverage'
  | 'codacy_get_repository_pull_request_files_coverage'
  | 'codacy_get_pull_request_git_diff'
  | 'codacy_list_pull_request_issues'
  | 'codacy_get_repository_with_analysis'
  | 'codacy_get_file_with_analysis'
  | 'codacy_get_repository_pull_request'
  | 'codacy_get_issue'
  | 'codacy_get_pattern';
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
  codacy_get_repository_with_analysis: {
    tool: getRepositoryWithAnalysisTool,
    handler: getRepositoryWithAnalysisHandler,
  },
  codacy_get_file_with_analysis: {
    tool: getFileWithAnalysisTool,
    handler: getFileWithAnalysisHandler,
  },
  codacy_get_repository_pull_request: {
    tool: getRepositoryPullRequestTool,
    handler: getRepositoryPullRequestHandler,
  },
  codacy_get_issue: {
    tool: getIssueTool,
    handler: getIssueHandler,
  },
  codacy_get_pattern: {
    tool: getPatternTool,
    handler: getPatternHandler,
  },
  codacy_list_repository_tool_patterns: {
    tool: listRepositoryToolPatternsTool,
    handler: listRepositoryToolPatternsHandler,
  },
  codacy_list_tools: {
    tool: listToolsTool,
    handler: listToolsHandler,
  },
  codacy_list_repository_tools: {
    tool: listRepositoryToolsTool,
    handler: listRepositoryToolsHandler,
  },
  codacy_list_organization: {
    tool: listOrganizationsTool,
    handler: listOrganizationsHandler,
  },
};

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.values(toolDefinitions).map(({ tool }) => tool),
}));

// Register resources
server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
  resourceTemplates: resourceTemplates.map(({ name, description, uriTemplate }) => ({
    name,
    description,
    uriTemplate,
  })),
}));

// Register resource handlers
server.setRequestHandler(ReadResourceRequestSchema, async (request, _extra) => {
  try {
    const uri = request.params.uri;

    // Find matching resource template
    const template = resourceTemplates.find((t: { name: string; uriTemplate: string }) =>
      uri.startsWith(t.name)
    );

    if (!template) {
      throw new Error(`No matching resource template found for URI: ${uri}`);
    }

    // Parse URI parameters
    const params = parseUri(uri, template.uriTemplate);
    if (!params) {
      throw new Error(`Invalid resource URI format. Expected format: ${template.uriTemplate}`);
    }

    // Validate organization
    const validatedArgs = validateOrganization({
      provider: params.provider,
      organization: params.organization,
      repository: params.repository,
    });

    // Handle different resource types
    let result;
    switch (template.type) {
      case 'codacy/organizations':
        result = await listOrganizationsHandler(validatedArgs);
        break;
      case 'codacy/repositories':
        result = await listOrganizationRepositoriesHandler(validatedArgs);
        break;
      case 'codacy/files':
        result = await listFilesHandler(validatedArgs);
        break;
      case 'codacy/tools':
        result = await listToolsHandler(validatedArgs);
        break;
      case 'codacy/pattern':
        result = await getPatternHandler(validatedArgs);
        break;

      default:
        throw new Error(`Unsupported resource type: ${template.type}`);
    }

    return {
      content: result,
      _meta: {},
    };
  } catch (error) {
    console.error('Error reading resource:', error);
    throw error;
  }
});

// Register request handlers
server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    if (!request.params.arguments) {
      throw new Error('Arguments are required');
    }

    const toolDefinition = toolDefinitions[request.params.name as toolKeys];
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
