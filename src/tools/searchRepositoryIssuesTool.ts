import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { codacyLanguages, issueCategories } from './utils.js';

export const searchRepositoryIssuesTool: Tool = {
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
