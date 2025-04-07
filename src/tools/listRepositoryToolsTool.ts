import { CodacyTool, repositorySchema, toolNames } from '../schemas.js';

export const listRepositoryToolsTool: CodacyTool = {
  name: toolNames.CODACY_LIST_REPOSITORY_TOOLS,
  description:
    'Get analysis tools settings of a repository. This endpoint returns the analysis tools available in Codacy for a repository.',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
    },
    required: ['provider', 'organization', 'repository'],
  },
};
