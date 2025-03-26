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
  description: 'List issues in a repository with pagination',
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
];

const securityScanTypes = [
  { value: 'SAST', name: 'Code scanning' },
  { value: 'Secrets', name: 'Secret scanning' },
  { value: 'SCA', name: 'Dependency scanning' },
  { value: 'IaC', name: 'Infrastructure-as-code scanning' },
  { value: 'CICD', name: 'CI/CD scanning' },
  { value: 'DAST', name: 'DAST' },
  { value: 'PenTesting', name: 'Penetration testing' },
];

const searchSecurityItemsTool: Tool = {
  name: 'codacy_list_srm_items',
  description:
    'List security and risk management (SRM) items/issues/vulnerabilities/findings for an organization with pagination',
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
            type: 'array',
            description:
              'Security issue priorities/severities to filter. Accepted values: Low, Medium, High, Critical',
          },
          categories: {
            type: 'array',
            description: `Security categories to filter. Accepted values: ${securityCategories.join(', ')} or _other_ (to search for issues that don't have a security category)`,
          },
          scanTypes: {
            type: 'array',
            description: `Security issue scan types to filter. Accepted values: ${securityScanTypes.map(scanType => `${scanType.value} (${scanType.name})`).join(', ')}`,
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

// Handlers
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
      case 'codacy_list_srm_items': {
        const result = await searchSecurityItemsHandler(request.params.arguments);
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
