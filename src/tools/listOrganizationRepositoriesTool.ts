import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listOrganizationRepositoriesTool: Tool = {
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
