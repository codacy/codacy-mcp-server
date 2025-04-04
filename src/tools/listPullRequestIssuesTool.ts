import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  defaultPagination,
  generalOrganizationMistakes,
  generalRepositoryMistakes,
  repositorySchema,
} from '../utils.js';

const rules = `
Use this tool to list the issues for specific pull requests. 

Common use cases: 
- When the user asks for the issues for a specific pull request
- When the user is in a pull request context and asks for the issues

Common mistakes: 
- Using this tool for listing the issues for specific files
- Using this tool for listing the issues for an entire repository
${generalOrganizationMistakes}
${generalRepositoryMistakes}
`;

export const listPullRequestIssuesTool: Tool = {
  name: 'codacy_list_pull_request_issues',
  description: `Returns a list of issues found in a pull request. We can request either new or fixed issues. \n ${rules}`,
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      ...defaultPagination,
      pullRequestNumber: {
        type: 'number',
        description: 'Pull request number',
      },
      status: {
        type: 'string',
        description: 'Filter issues by status. Accepted values: all, new, fixed.',
        enum: ['all', 'new', 'fixed'],
      },
      onlyPotential: {
        type: 'boolean',
        description: 'If true, retrieves only potential issues',
      },
    },
    required: ['provider', 'organization', 'repository'],
  },
};
