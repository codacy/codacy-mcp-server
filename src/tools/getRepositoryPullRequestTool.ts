import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { repositorySchema } from './utils.js';

export const getRepositoryPullRequestTool: Tool = {
  name: 'codacy_get_repository_pull_request',
  description: 'Get the pull request information for a repository.',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      pullRequestNumber: {
        type: 'number',
        description: 'Pull request number',
      },
    },
  },
};
