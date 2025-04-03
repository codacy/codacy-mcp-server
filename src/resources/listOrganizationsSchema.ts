import { defaultPagination, organizationSchema } from '../utils.js';

export const listOrganizationsSchema = {
  type: 'object' as const,
  properties: {
    provider: organizationSchema.provider,
    ...defaultPagination,
  },
};
