import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { listOrganizationsSchema } from '../resources/listOrganizationsSchema.js';

export const listOrganizationsTool: Tool = {
  name: 'codacy_list_organizations',
  description: 'List organizations with pagination',
  inputSchema: listOrganizationsSchema,
};
