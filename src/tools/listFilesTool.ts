import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listFilesTool: Tool = {
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
