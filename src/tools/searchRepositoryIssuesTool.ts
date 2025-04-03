import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  branchSchema,
  codacyLanguages,
  defaultPagination,
  issueCategories,
  repositorySchema,
} from './utils.js';

export const searchRepositoryIssuesTool: Tool = {
  name: 'codacy_list_repository_issues',
  description:
    'Lists and filters code quality issues in a repository. This is the primary tool for investigating general code quality concerns (e.g. best practices, performance, complexity, style) but NOT security issues. For security-related issues, use the SRM items tool instead. Features include:\n\n- Pagination support for handling large result sets\n- Filtering by multiple criteria including severity, category, and language\n- Author-based filtering for accountability\n- Branch-specific analysis\n- Pattern-based searching\n\nCommon use cases:\n- Code quality audits\n- Technical debt assessment\n- Style guide compliance checks\n- Performance issue investigation\n- Complexity analysis',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      ...defaultPagination,
      body: {
        type: 'object',
        description: 'Search parameters to filter the list of issues in a repository',
        properties: {
          ...branchSchema,
          patternIds: {
            type: 'array',
            description: 'Set of code pattern identifiers',
            items: {
              type: 'string',
              description: 'Code pattern identifier',
            },
          },
          languages: {
            type: 'array',
            description: `Set of language names, without spaces. Accepted values: ${codacyLanguages.join(', ')}`,
            items: {
              type: 'string',
              enum: codacyLanguages,
              description: 'Language name',
            },
          },
          categories: {
            type: 'array',
            description: `Set of issue categories. Accepted values: ${issueCategories.join(', ')}`,
            items: {
              type: 'string',
              enum: issueCategories,
              description: 'Issue category',
            },
          },
          levels: {
            type: 'array',
            description:
              'Set of issue severity levels. Accepted values: Info, Warning and Error. Codacy maps these values as follows: Info->Minor, Warning->Medium, Error->Critical',
            items: {
              type: 'string',
              enum: ['Info', 'Warning', 'Error'],
              description: 'Issue severity level',
            },
          },
          authorEmails: {
            type: 'array',
            description: 'Set of commit author email addresses',
            items: {
              type: 'string',
              description: 'Commit author email address',
            },
          },
        },
      },
    },
    required: ['provider', 'organization', 'repository'],
  },
};
