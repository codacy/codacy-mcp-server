import { CodacyTool, repositorySchema, toolNames } from '../schemas.js';

export const getRepositoryPullRequestFilesCoverageTool: CodacyTool = {
  name: toolNames.CODACY_GET_REPOSITORY_PULL_REQUEST_FILES_COVERAGE,
  description: 'Get coverage information for all files in a pull request.',
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
