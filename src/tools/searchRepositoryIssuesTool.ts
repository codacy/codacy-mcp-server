import { codacyLanguages, issueCategories } from '../utils.js';
import { searchSecurityItemsTool } from './searchSecurityItemsTool.js';
import { listFileIssuesTool } from './listFileIssuesTool.js';
import { listPullRequestIssuesTool } from './listPullRequestIssuesTool.js';
import {
  repositorySchema,
  branchSchema,
  defaultPagination,
  toolNames,
  CodacyTool,
} from '../schemas.js';
import { generalOrganizationMistakes, generalRepositoryMistakes } from '../rules.js';

const rules = `
  This is the primary tool for investigating general code quality concerns (e.g. best practices, performance, complexity, style) but NOT security issues. 
  For security-related issues, use the ${searchSecurityItemsTool.name} tool instead. 
  For listing the issues for specific files, use the ${listFileIssuesTool.name} tool instead.
  For listing the issues for specific pull requests, use the ${listPullRequestIssuesTool.name} tool instead.
  
  Features include: 
  - Pagination support for handling large result sets
  - Filtering by multiple criteria including severity, category, and language
  - Author-based filtering for accountability
  - Branch-specific analysis
  - Pattern-based searching
  
  Common use cases: 
  - When the user asks for code quality audits 
  - When the user asks for technical debt assessment
  - When the user asks for style guide compliance checks
  - When the user asks for performance issue investigation
  - When the user asks for complexity analysis
  - When the user asks for code quality issues

  Common mistakes: 
  - Using this tool for security-related issues
  - Using this tool for listing the issues for specific files
  ${generalOrganizationMistakes}
  ${generalRepositoryMistakes}
`;

export const searchRepositoryIssuesTool: CodacyTool = {
  name: toolNames.CODACY_LIST_REPOSITORY_ISSUES,
  description: `Lists and filters code quality issues in a repository.
    \n ${rules}`,
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
