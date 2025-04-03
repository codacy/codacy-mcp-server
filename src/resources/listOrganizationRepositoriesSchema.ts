import { defaultPagination, organizationSchema } from '../utils.js';

export const listOrganizationRepositoriesSchema = {
  type: 'object' as const,
  properties: {
    ...organizationSchema,
    ...defaultPagination,
  },
  required: ['provider', 'organization'],
};
