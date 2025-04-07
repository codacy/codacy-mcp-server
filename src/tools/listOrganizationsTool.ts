import { CodacyTool, defaultPagination, organizationSchema, toolNames } from '../schemas.js';

export const listOrganizationsTool: CodacyTool = {
  name: toolNames.CODACY_LIST_ORGANIZATIONS,
  description:
    'List organizations with pagination. \n Common mistakes: \n - Using this tool without the provider',
  inputSchema: {
    type: 'object',
    properties: {
      provider: organizationSchema.provider,
      ...defaultPagination,
    },
    required: ['provider'],
  },
};
