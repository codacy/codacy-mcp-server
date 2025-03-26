#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import {
  OpenAPI,
  OrganizationService,
  RepositoryService,
  AnalysisService,
  SecurityService,
  CoverageService,
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

const codacyLanguages = [
  'C',
  'CPP',
  'CSharp',
  'Java',
  'Go',
  'Kotlin',
  'Ruby',
  'Scala',
  'Dart',
  'Python',
  'TypeScript',
  'Javascript',
  'CoffeeScript',
  'Swift',
  'JSP',
  'VisualBasic',
  'PHP',
  'PLSQL',
  'SQL',
  'TSQL',
  'Crystal',
  'Haskell',
  'Elixir',
  'Groovy',
  'Apex',
  'VisualForce',
  'Velocity',
  'CSS',
  'HTML',
  'LESS',
  'SASS',
  'Dockerfile',
  'Terraform',
  'Shell',
  'Powershell',
  'JSON',
  'XML',
  'YAML',
  'Markdown',
  'Cobol',
  'ABAP',
  'ObjectiveC',
  'Rust',
];

const issueCategories = [
  'security',
  'errorprone',
  'performance',
  'complexity',
  'unusedcode',
  'comprehensibility',
  'compatibility',
  'bestpractice',
  'codestyle',
  'documentation',
];

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

const searchRepositoryIssuesTool: Tool = {
  name: 'codacy_list_repository_issues',
  description:
    'Lists and filters code quality issues in a repository. This is the primary tool for investigating general code quality concerns (e.g. best practices, performance, complexity, style) but NOT security issues. For security-related issues, use the SRM items tool instead. Features include:\n\n- Pagination support for handling large result sets\n- Filtering by multiple criteria including severity, category, and language\n- Author-based filtering for accountability\n- Branch-specific analysis\n- Pattern-based searching\n\nCommon use cases:\n- Code quality audits\n- Technical debt assessment\n- Style guide compliance checks\n- Performance issue investigation\n- Complexity analysis',
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
      body: {
        type: 'object',
        description: 'Search parameters to filter the list of issues in a repository',
        properties: {
          branchName: {
            type: 'string',
            description:
              'Branch name, by default the main branch defined on the Codacy repository settings is used',
          },
          patternIds: {
            type: 'array',
            description: 'Set of code pattern identifiers',
          },
          languages: {
            type: 'array',
            description: `Set of language names, without spaces. Accepted values: ${codacyLanguages.join(', ')}`,
          },
          categories: {
            type: 'array',
            description: `Set of issue categories. Accepted values: ${issueCategories.join(', ')}`,
          },
          levels: {
            type: 'array',
            description:
              'Set of issue severity levels. Accepted values: Info, Warning and Error. Codacy maps these values as follows: Info->Minor, Warning->Medium, Error->Critical',
          },
          authorEmails: {
            type: 'array',
            description: 'Set of commit author email addresses',
          },
        },
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

const securityStatuses = {
  Open: ['OnTrack', 'DueSoon', 'Overdue'],
  Closed: ['ClosedOnTime', 'ClosedLate', 'Ignored'],
};

const securityCategories = [
  'Auth',
  'CommandInjection',
  'Cookies',
  'Cryptography',
  'CSRF',
  'DoS',
  'FileAccess',
  'HTTP',
  'InputValidation',
  'InsecureModulesLibraries',
  'InsecureStorage',
  'Other',
  'Regex',
  'SQLInjection',
  'UnexpectedBehaviour',
  'Visibility',
  'XSS',
  '_other_',
];

const securityScanTypes = {
  SAST: 'Code scanning',
  Secrets: 'Secret scanning',
  SCA: 'Dependency scanning',
  IaC: 'Infrastructure-as-code scanning',
  CICD: 'CI/CD scanning',
  DAST: 'Dynamic Application Security Testing',
  PenTesting: 'Penetration testing',
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

const searchSecurityItemsTool: Tool = {
  name: 'codacy_list_srm_items',
  description: `Primary tool to list security items/issues/vulnerabilities/findings, results are related to the organization security and risk management (SRM) dashboard on Codacy. This tool contains pagination. Returns comprehensive security analysis including ${Object.keys(securityScanTypes).join(', ')} security issues. Provides advanced filtering by security categories, priorities, and scan types. Use this as the first tool when investigating security or compliance concerns. Map the results statuses as open issues: ${securityStatuses.Open.join(', ')}; and closed issues: ${securityStatuses.Closed.join(', ')}. Prioritize the open issues as the most important ones in the results.`,
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
      sort: {
        type: 'string',
        description: 'Sort SRM items by. Accepted values: Status, DetectedAt',
      },
      direction: {
        type: 'string',
        description: 'Sort direction (ascending or descending). Accepted values: asc, desc',
      },
      body: {
        type: 'object',
        description:
          'Search parameters to filter the metrics of the security issues dashboard of an organization',
        properties: {
          repositories: {
            type: 'array',
            description: 'Repository names',
          },
          priorities: {
            description: 'Array of security issue priorities/severities to filter by.',
            type: 'array',
            items: {
              type: 'string',
              enum: ['Low', 'Medium', 'High', 'Critical'],
            },
          },
          statuses: {
            type: 'array',
            description:
              'Array of security issue statuses to filter by. Must be one or more of the following values:\n\nOpen issues:\n- OnTrack\n- DueSoon\n- Overdue\n\nClosed issues:\n- ClosedOnTime\n- ClosedLate\n- Ignored',
            items: {
              type: 'string',
              enum: ['OnTrack', 'DueSoon', 'Overdue', 'ClosedOnTime', 'ClosedLate', 'Ignored'],
            },
          },
          categories: {
            description: 'Array of security categories to filter by.',
            type: 'array',
            items: {
              type: 'string',
              enum: securityCategories,
            },
            note: "_other_ can be used to search for issues that don't have a security category",
          },
          scanTypes: {
            description: 'Array of security scan types to filter by.',
            type: 'array',
            items: {
              type: 'string',
              enum: Object.keys(securityScanTypes),
            },
            mapping: securityScanTypes,
          },
          segments: {
            type: 'array',
            description:
              'Set of segments ids (type number). Segment is a Codacy concept that groups repositories by different criteria',
          },
        },
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
    cursor,
    limit
  );
};

const getFileCoverageHandler = async (args: any) => {
  const { provider, organization, repository, fileId } = args;

  return await RepositoryService.getFileCoverage(provider, organization, repository, fileId);
};

const searchRepositoryIssuesHandler = async (args: any) => {
  const { provider, organization, repository, limit, cursor, body } = args;

  return await AnalysisService.searchRepositoryIssues(
    provider,
    organization,
    repository,
    cursor,
    limit,
    body
  );
};

const listRepositoryPullRequestsHandler = async (args: any) => {
  const { provider, organization, repository, search, includeNotAnalyzed, cursor, limit } = args;
  return await AnalysisService.listRepositoryPullRequests(
    provider,
    organization,
    repository,
    limit,
    cursor,
    search,
    includeNotAnalyzed
  );
};

const searchSecurityItemsHandler = async (args: any) => {
  const { provider, organization, cursor, limit, sort, direction, body } = args;

  return await SecurityService.searchSecurityItems(
    provider,
    organization,
    cursor,
    limit,
    sort,
    direction,
    body
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

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      listOrganizationRepositoriesTool,
      searchRepositoryIssuesTool,
      listFilesTool,
      getFileIssuesTool,
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
