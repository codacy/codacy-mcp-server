import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { defaultPagination, organizationSchema } from '../schemas.js';
import { generalOrganizationMistakes } from '../utils.js';

const rules = `
Common mistakes:
- Using this tool without the provider
${generalOrganizationMistakes}
`;

export const listOrganizationRepositoriesTool: Tool = {
  name: 'codacy_list_organization_repositories',
  description: `List repositories in an organization with pagination.
  ${rules}`,
  inputSchema: {
    type: 'object',
    properties: {
      ...organizationSchema,
      ...defaultPagination,
    },
    required: ['provider', 'organization'],
  },
};
