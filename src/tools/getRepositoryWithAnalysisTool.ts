import { branchSchema, CodacyTool, repositorySchema, toolNames } from '../schemas.js';

export const getRepositoryWithAnalysisTool: CodacyTool = {
  name: toolNames.CODACY_GET_REPOSITORY_WITH_ANALYSIS,
  description:
    'Get repository with analysis information. Here you will find results for five metrics: Grade, Issues, Duplication, Complexity and Coverage. LoC stands for Lines of Code, and Codacy prefers to show the Issues metric as /kLoC (issues per thousand lines of code).',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      ...branchSchema,
    },
    required: ['provider', 'organization', 'repository'],
  },
};
