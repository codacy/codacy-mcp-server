import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { repositorySchema } from './utils.js';

export const getFileCoverageTool: Tool = {
  name: 'codacy_get_file_coverage',
  description: 'Get coverage information for a file in the head commit of a repository branch.',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      fileId: {
        type: 'string',
        description: 'Identifier of a file in a specific commit',
      },
    },
  },
};
