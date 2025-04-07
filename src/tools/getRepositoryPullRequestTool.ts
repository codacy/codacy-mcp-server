import { CodacyTool, repositorySchema, toolNames } from '../schemas.js';

export const getRepositoryPullRequestTool: CodacyTool = {
  name: toolNames.CODACY_GET_REPOSITORY_PULL_REQUEST,
  description:
    'Get the pull request information for a repository. The response contains the analysis of the pull request.',
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
