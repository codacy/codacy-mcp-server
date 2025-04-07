import { CodacyTool, defaultPagination, organizationSchema, toolNames } from '../schemas.js';
import { generalOrganizationMistakes } from '../rules.js';

const rules = `
Common mistakes:
- Using this tool without the provider
${generalOrganizationMistakes}
`;

export const listOrganizationRepositoriesTool: CodacyTool = {
  name: toolNames.CODACY_LIST_ORGANIZATION_REPOSITORIES,
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
