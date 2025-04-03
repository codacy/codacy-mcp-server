import { getPaginationWithSorting, repositorySchema } from '../utils.js';

export const listFilesSchema = {
  type: 'object' as const,
  properties: {
    ...repositorySchema,
    ...getPaginationWithSorting(
      "Field used to sort the list of files. The allowed values are 'filename', 'issues', 'grade', 'duplication', 'complexity', and 'coverage'."
    ),
    branch: {
      type: 'string',
      description: 'Name of a repository branch enabled on Codacy',
    },
    search: {
      type: 'string',
      description: 'Filter files that include this string anywhere in their relative path',
    },
  },
  required: ['provider', 'organization', 'repository'],
};
