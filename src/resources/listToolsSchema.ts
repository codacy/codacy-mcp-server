import { defaultPagination } from '../utils.js';

export const listToolsSchema = {
  type: 'object' as const,
  properties: {
    ...defaultPagination,
  },
};
