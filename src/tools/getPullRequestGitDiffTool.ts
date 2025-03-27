import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getPullRequestGitDiffTool: Tool = {
  name: 'codacy_get_pull_request_git_diff',
  description: 'Returns the human-readable Git diff of a pull request',
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
    },
  },
};
