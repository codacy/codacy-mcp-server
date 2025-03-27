import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { defaultPagination, repositorySchema } from './utils.js';

export const listRepositoryPullRequestsTool: Tool = {
  name: 'codacy_list_repository_pull_requests',
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
  },
};
