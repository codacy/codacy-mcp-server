import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { branchSchema, repositorySchema } from '../schemas.js';

export const getRepositoryWithAnalysisTool: Tool = {
  name: 'codacy_get_repository_with_analysis',
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
