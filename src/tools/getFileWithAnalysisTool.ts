import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { fileSchema } from './utils.js';

export const getFileWithAnalysisTool: Tool = {
  name: 'codacy_get_file_with_analysis',
  description:
    "Get file information and it's analysis information and coverage metrics. A file that is ignored is not analyzed by Codacy. Here you will find results for five metrics: Grade, Issues, Duplication, Complexity and Coverage.",
  inputSchema: {
    type: 'object',
    properties: {
      ...fileSchema,
    },
    required: ['provider', 'organization', 'repository'],
  },
};
