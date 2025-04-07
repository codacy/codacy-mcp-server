import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { defaultPagination } from '../schemas.js';

export const listToolsTool: Tool = {
  name: 'codacy_list_tools',
  description: 'List all code analysis tools available in Codacy.',
  inputSchema: {
    type: 'object',
    properties: {
      ...defaultPagination,
    },
  },
};
