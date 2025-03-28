import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { repositorySchema } from './utils.js';

export const listRepositoryToolsTool: Tool = {
  name: 'codacy_list_repository_tools',
  description: 'List all tools available for a repository',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
    },
  },
};
