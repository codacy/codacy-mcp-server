import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { listFilesSchema } from '../resources/listFilesSchema.js';

export const listFilesTool: Tool = {
  name: 'codacy_list_files',
  description:
    "List files in a repository with pagination. Supports sorting by various metrics (coverage, grade, issues, etc.) and filtering. Use sort='coverage' and direction='desc' to efficiently find files with high coverage, or sort='grade' for code quality analysis. Use search to filter files by name. ",
  inputSchema: listFilesSchema,
};
