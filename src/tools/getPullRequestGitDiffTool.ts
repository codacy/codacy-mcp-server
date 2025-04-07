import { CodacyTool, repositorySchema, toolNames } from '../schemas.js';

export const getPullRequestGitDiffTool: CodacyTool = {
  name: toolNames.CODACY_GET_PULL_REQUEST_GIT_DIFF,
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
