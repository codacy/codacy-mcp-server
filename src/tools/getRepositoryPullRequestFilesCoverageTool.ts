import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { repositorySchema } from './utils.js';

export const getRepositoryPullRequestFilesCoverageTool: Tool = {
  name: 'codacy_get_repository_pull_request_files_coverage',
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
  },
};
