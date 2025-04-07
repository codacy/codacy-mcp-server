import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { defaultPagination, organizationSchema } from '../schemas.js';

export const listOrganizationsTool: Tool = {
  name: 'codacy_list_organizations',
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
