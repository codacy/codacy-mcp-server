#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import {
  AnalysisService,
  CoverageService,
  OpenAPI,
  OrganizationService,
  RepositoryService,
} from './src/api/client/index.js';

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

// Tool definitions
const listOrganizationRepositoriesTool: Tool = {
  name: 'codacy_list_repositories',
  description: 'List repositories in an organization with pagination',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        description:
          "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb.",
      },
      organization: {
        type: 'string',
        description: 'Organization name',
      },
      cursor: {
        type: 'string',
        description: 'Pagination cursor for next page of results',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default 100, max 100)',
        default: 100,
      },
    },
  },
};

//File endpoints
const listFilesTool: Tool = {
  name: 'codacy_list_files',
  description: 'List files in a repository with pagination',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        description:
          "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb.",
      },
      organization: {
        type: 'string',
        description: 'Organization name on the Git provider',
      },
      repository: {
        type: 'string',
        description: 'Repository name on the Git provider organization',
      },
      branch: {
        type: 'string',
        description: 'Name of a repository branch enabled on Codacy',
      },
      search: {
        type: 'string',
        description: 'Filter files that include this string anywhere in their relative path',
      },
      sort: {
        type: 'string',
        description:
          "Field used to sort the list of files. The allowed values are 'filename', 'issues', 'grade', 'duplication', 'complexity', and 'coverage'.",
      },
      direction: {
        type: 'string',
        description:
          "Sort direction. Possible values are 'asc' (ascending) or 'desc' (descending).",
      },
      cursor: {
        type: 'string',
        description: 'Pagination cursor for next page of results',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default 100, max 100)',
        default: 100,
      },
    },
  },
};

const getFileIssuesTool: Tool = {
  name: 'codacy_get_file_issues',
  description: 'Get the issue list for a file in a repository',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        description:
          "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb.",
      },
      organization: {
        type: 'string',
        description: 'Organization name on the Git provider',
      },
      repository: {
        type: 'string',
        description: 'Repository name on the Git provider organization',
      },
      fileId: {
        type: 'string',
        description: 'Identifier of a file in a specific commit',
      },
      cursor: {
        type: 'string',
        description: 'Pagination cursor for next page of results',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default 100, max 100)',
        default: 100,
      },
    },
  },
};

const getFileCoverageTool: Tool = {
  name: 'codacy_get_file_coverage',
  description: 'Get coverage information for a file in the head commit of a repository branch.',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        description:
          "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb.",
      },
      organization: {
        type: 'string',
        description: 'Organization name on the Git provider',
      },
      repository: {
        type: 'string',
        description: 'Repository name on the Git provider organization',
      },
      fileId: {
        type: 'string',
        description: 'Identifier of a file in a specific commit',
      },
    },
  },
};

//PR endpoints

const listRepositoryPullRequestsTool: Tool = {
  name: 'codacy_list_repository_pull_requests',
  description:
    'List pull requests from a repository that the user has access to. You can search this endpoint for either last-updated (default), impact or merged',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        description:
          "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb.",
      },
      organization: {
        type: 'string',
        description: 'Organization name on the Git provider',
      },
      repository: {
        type: 'string',
        description: 'Repository name on the Git provider organization',
      },
      search: {
        type: 'string',
        description: 'Filter the results searching by this string.',
      },
      includeNotAnalyzed: {
        type: 'boolean',
        description: 'If true, includes pull requests that have not been analyzed',
      },
      cursor: {
        type: 'string',
        description: 'Pagination cursor for next page of results',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default 100, max 100)',
        default: 100,
      },
    },
  },
};

const listPullRequestIssuesTool: Tool = {
  name: 'codacy_list_pull_request_issues',
  description:
    'Returns a list of issues found in a pull request. We can request either new or fixed issues.',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        description:
          "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb.",
      },
      organization: {
        type: 'string',
        description: 'Organization name on the Git provider',
      },
      repository: {
        type: 'string',
        description: 'Repository name on the Git provider organization',
      },
      pullRequestNumber: {
        type: 'number',
        description: 'Pull request number',
      },
      status: {
        type: 'string',
        description: 'Filter issues by status. Accepted values: all, new, fixed.',
      },
      onlyPotential: {
        type: 'boolean',
        description: 'If true, retrieves only potential issues',
      },
      cursor: {
        type: 'string',
        description: 'Pagination cursor for next page of results',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default 100, max 100)',
        default: 100,
      },
    },
  },
};

const getRepositoryPullRequestFilesCoverageTool: Tool = {
  name: 'codacy_get_repository_pull_request_files_coverage',
  description: 'Get coverage information for all files in a pull request.',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        description:
          "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb.",
      },
      organization: {
        type: 'string',
        description: 'Organization name on the Git provider',
      },
      repository: {
        type: 'string',
        description: 'Repository name on the Git provider organization',
      },
      pullRequestNumber: {
        type: 'number',
        description: 'Pull request number',
      },
    },
  },
};

const getPullRequestGitDiffTool: Tool = {
  name: 'codacy_get_pull_request_git_diff',
  description: 'Returns the human-readable Git diff of a pull request',
  inputSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        description:
          "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb.",
      },
      organization: {
        type: 'string',
        description: 'Organization name on the Git provider',
      },
      repository: {
        type: 'string',
        description: 'Repository name on the Git provider organization',
      },
      pullRequestNumber: {
        type: 'number',
        description: 'Pull request number',
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

const listFilesHandler = async (args: any) => {
  const { provider, organization, repository, branch, search, sort, direction, cursor, limit } =
    args;
  return await RepositoryService.listFiles(
    provider,
    organization,
    repository,
    branch,
    search,
    sort,
    direction,
    cursor,
    limit
  );
};

const getFileIssuesHandler = async (args: any) => {
  const { provider, organization, repository, fileId, limit, cursor } = args;

  return await RepositoryService.getFileIssues(
    provider,
    organization,
    repository,
    fileId,
    limit,
    cursor
  );
};

const getFileCoverageHandler = async (args: any) => {
  const { provider, organization, repository, fileId } = args;

  return await RepositoryService.getFileCoverage(provider, organization, repository, fileId);
};

const listRepositoryPullRequestsHandler = async (args: any) => {
  const { provider, organization, repository, search, includeNotAnalyzed, cursor, limit } = args;
  return await AnalysisService.listRepositoryPullRequests(
    provider,
    organization,
    repository,
    cursor,
    limit,
    search,
    includeNotAnalyzed
  );
};

const listPullRequestIssuesHandler = async (args: any) => {
  const {
    provider,
    organization,
    repository,
    pullRequestNumber,
    status,
    onlyPotential,
    cursor,
    limit,
  } = args;
  return await AnalysisService.listPullRequestIssues(
    provider,
    organization,
    repository,
    pullRequestNumber,
    status,
    onlyPotential,
    cursor,
    limit
  );
};

const getRepositoryPullRequestFilesCoverageHandler = async (args: any) => {
  const { provider, organization, repository, pullRequestNumber } = args;
  return await CoverageService.getRepositoryPullRequestFilesCoverage(
    provider,
    organization,
    repository,
    pullRequestNumber
  );
};

const getPullRequestGitDiffHandler = async (args: any) => {
  const { provider, organization, repository, pullRequestNumber } = args;
  return await CoverageService.getPullRequestGitDiff(
    provider,
    organization,
    repository,
    pullRequestNumber
  );
};

// const getPullRequestDiffHandler = async (args: any) => {
//   const { provider, organization, repository, pullRequestNumber } = args;
//   return await RepositoryService.getPullRequestDiff(
//     provider,
//     organization,
//     repository,
//     pullRequestNumber
//   );
// };

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      listOrganizationRepositoriesTool,
      listFilesTool,
      getFileIssuesTool,
      getFileCoverageTool,
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
      case 'codacy_list_repository_pull_requests': {
        const result = await listRepositoryPullRequestsHandler(request.params.arguments);
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
