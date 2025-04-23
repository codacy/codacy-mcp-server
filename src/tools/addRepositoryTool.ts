import { CodacyTool, repositorySchema, toolNames } from '../schemas.js';

export const addRepositoryTool: CodacyTool = {
  name: toolNames.CODACY_ADD_REPOSITORY,
  description:
    'Use this tool to add a new repository or follow an already added repository in an existing organization in Codacy',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
    },
    required: ['provider', 'organization', 'repository'],
  },
};
