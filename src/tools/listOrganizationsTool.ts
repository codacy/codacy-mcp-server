import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { defaultPagination, organizationSchema } from './utils.js';

export const listOrganizationsTool: Tool = {
  name: 'codacy_list_organizations',
  description: 'List organizations with pagination',
  inputSchema: {
    type: 'object',
    properties: {
      provider: organizationSchema.provider,
      ...defaultPagination,
    },
  },
};
