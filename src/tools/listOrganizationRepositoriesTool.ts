import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { defaultPagination, organizationSchema } from './utils.js';

export const listOrganizationRepositoriesTool: Tool = {
  name: 'codacy_list_organization_repositories',
  description: 'List repositories in an organization with pagination',
  inputSchema: {
    type: 'object',
    properties: {
      ...organizationSchema,
      ...defaultPagination,
    },
  },
};
