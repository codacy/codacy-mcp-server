import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { fileSchema } from './utils.js';

export const getFileCoverageTool: Tool = {
  name: 'codacy_get_file_coverage',
  description: 'Get coverage information for a file in the head commit of a repository branch.',
  inputSchema: {
    type: 'object',
    properties: {
      ...fileSchema,
    },
  },
};
