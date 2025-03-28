import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { defaultPagination } from './utils.js';

export const listToolsTool: Tool = {
  name: 'codacy_list_tools',
  description: 'List all available tools',
  inputSchema: {
    type: 'object',
    properties: {
      ...defaultPagination,
    },
  },
};
