import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { defaultPagination, repositorySchema } from '../utils.js';

export const listPullRequestIssuesTool: Tool = {
  name: 'codacy_list_pull_request_issues',
  description:
    'Returns a list of issues found in a pull request. We can request either new or fixed issues.',
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
      },
      onlyPotential: {
        type: 'boolean',
        description: 'If true, retrieves only potential issues',
      },
    },
    required: ['provider', 'organization', 'repository'],
  },
};
