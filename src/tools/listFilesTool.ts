import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getPaginationWithSorting, repositorySchema } from './utils.js';

export const listFilesTool: Tool = {
  name: 'codacy_list_files',
  description:
    "List files in a repository with pagination. Supports sorting by various metrics (coverage, grade, issues, etc.) and filtering. Use sort='coverage' and direction='desc' to efficiently find files with high coverage, or sort='grade' for code quality analysis. Use search to filter files by name. ",
  inputSchema: {
    type: 'object',
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
  },
};
