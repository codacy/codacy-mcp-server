import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listRepositoryPullRequestsTool: Tool = {
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
