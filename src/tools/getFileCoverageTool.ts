import { CodacyTool, fileSchema, toolNames } from '../schemas.js';

export const getFileCoverageTool: CodacyTool = {
  name: toolNames.CODACY_GET_FILE_COVERAGE,
  description: 'Get coverage information for a file in the head commit of a repository branch.',
  inputSchema: {
    type: 'object',
    properties: {
      ...fileSchema,
    },
    required: ['provider', 'organization', 'repository'],
  },
};
