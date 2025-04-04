import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { listOrganizationsSchema } from '../schemas.js';

export const listOrganizationsTool: Tool = {
  name: 'codacy_list_organizations',
  description:
    'List organizations with pagination. \n Common mistakes: \n - Using this tool without the provider',
  inputSchema: { ...listOrganizationsSchema, required: ['provider'] },
};
