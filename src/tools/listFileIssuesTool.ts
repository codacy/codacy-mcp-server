import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { defaultPagination, repositorySchema } from './utils.js';

export const listFileIssuesTool: Tool = {
  name: 'codacy_get_file_issues',
  description: 'Get the issue list for a file in a repository',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      ...defaultPagination,
      fileId: {
        type: 'string',
        description: 'Identifier of a file in a specific commit',
      },
    },
  },
};
