import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getFileIssuesTool: Tool = {
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
