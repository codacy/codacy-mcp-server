import { CodacyTool, defaultPagination, repositorySchema, toolNames } from '../schemas.js';

export const listRepositoryPullRequestsTool: CodacyTool = {
  name: toolNames.CODACY_LIST_REPOSITORY_PULL_REQUESTS,
  description:
    'List pull requests from a repository that the user has access to. You can search this endpoint for either last-updated (default), impact or merged',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      ...defaultPagination,
      includeNotAnalyzed: {
        type: 'boolean',
        description: 'If true, includes pull requests that have not been analyzed',
      },
    },
    required: ['provider', 'organization', 'repository'],
  },
};
