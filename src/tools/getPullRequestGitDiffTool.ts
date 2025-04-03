import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { repositorySchema } from '../utils.js';

export const getPullRequestGitDiffTool: Tool = {
  name: 'codacy_get_pull_request_git_diff',
  description: 'Returns the human-readable Git diff of a pull request',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      pullRequestNumber: {
        type: 'number',
        description: 'Pull request number',
      },
    },
    required: ['provider', 'organization', 'repository'],
  },
};
