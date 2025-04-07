import { CodacyTool, fileSchema, toolNames } from '../schemas.js';

export const getFileWithAnalysisTool: CodacyTool = {
  name: toolNames.CODACY_GET_FILE_WITH_ANALYSIS,
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
