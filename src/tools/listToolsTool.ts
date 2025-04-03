import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { listToolsSchema } from '../resources/listToolsSchema.js';

export const listToolsTool: Tool = {
  name: 'codacy_list_tools',
  description: 'List all code analysis tools available in Codacy.',
  inputSchema: listToolsSchema,
};
