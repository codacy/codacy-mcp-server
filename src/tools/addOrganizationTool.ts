import { CodacyTool, organizationSchema, toolNames } from '../schemas.js';

export const addOrganizationTool: CodacyTool = {
  name: toolNames.CODACY_ADD_ORGANIZATION,
  description: 'Use this tool to add an organization from a Git provider to Codacy',
  inputSchema: {
    type: 'object',
    properties: {
      provider: organizationSchema.provider,
      remoteIdentifier: {
        type: 'string',
        description: 'The remote identifier of the organization',
      },
      name: {
        type: 'string',
        description: 'The name of the organization',
      },
      type: {
        type: 'string',
        description: 'The type of the organization',
        enum: ['Account', 'Organization'],
      },
    },
    required: ['provider', 'remoteIdentifier', 'name', 'type'],
  },
};
