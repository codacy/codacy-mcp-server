import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { repositorySchema } from './utils.js';

export const listRepositoryToolsTool: Tool = {
  name: 'codacy_list_repository_tools',
  description:
    'Get analysis tools settings of a repository. This endpoint returns the analysis tools available in Codacy for a repository.',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
    },
    required: ['provider', 'organization', 'repository'],
  },
};
