import { generalOrganizationMistakes, generalRepositoryMistakes } from '../rules.js';
import { CodacyTool, fileSchema, toolNames } from '../schemas.js';
import { listFilesTool } from './listFilesTool.js';

const rules = `
 If a file is ignored, it is not analyzed by Codacy. 
 Using this tool you'll get results for five metrics: Grade, Issues, Duplication, Complexity and Coverage.

 Common use cases: 
 - When the user asks for the analysis results of a specific file.
 
 Common mistakes: 
 - Using this tool with the wrong fileId. You can get the fileId by using the ${listFilesTool.name} tool with this file name as the search parameter.
 ${generalOrganizationMistakes}
 ${generalRepositoryMistakes}
`;

export const getFileWithAnalysisTool: CodacyTool = {
  name: toolNames.CODACY_GET_FILE_WITH_ANALYSIS,
  description: `Use this tool to get information for a file and it's analysis information and coverage metrics. \n ${rules}`,
  inputSchema: {
    type: 'object',
    properties: {
      ...fileSchema,
    },
    required: ['provider', 'organization', 'repository'],
  },
};
