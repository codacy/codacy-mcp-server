import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listPullRequestIssuesTool: Tool = {
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
