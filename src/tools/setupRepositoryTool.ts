import { CodacyTool, repositorySchema, toolNames } from '../schemas.js';

export const setupRepositoryTool: CodacyTool = {
  name: toolNames.CODACY_SETUP_REPOSITORY,
  description:
    'Use this tool to setup a repository. If the organization the repository belongs to is not added, this tool will add the organization and then add the repository to the organization. If the repository is not added and the user is an admin, this tool will add the repository to the organization. If the repository is already added and the user is not an admin, this tool will follow the repository.',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
    },
    required: ['provider', 'organization', 'repository'],
  },
};
