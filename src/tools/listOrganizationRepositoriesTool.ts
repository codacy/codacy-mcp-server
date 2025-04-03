import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { listOrganizationRepositoriesSchema } from '../resources/listOrganizationRepositoriesSchema.js';

export const listOrganizationRepositoriesTool: Tool = {
  name: 'codacy_list_organization_repositories',
  description: 'List repositories in an organization with pagination',
  inputSchema: listOrganizationRepositoriesSchema,
};
