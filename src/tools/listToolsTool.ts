import { CodacyTool, defaultPagination, toolNames } from '../schemas.js';

export const listToolsTool: CodacyTool = {
  name: toolNames.CODACY_LIST_TOOLS,
  description: 'List all code analysis tools available in Codacy.',
  inputSchema: {
    type: 'object',
    properties: {
      ...defaultPagination,
    },
  },
};
