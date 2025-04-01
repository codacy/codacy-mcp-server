import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getPaginationWithSorting, repositorySchema } from './utils.js';

export const listRepositoryToolPatternsTool: Tool = {
  name: 'codacy_list_repository_tool_patterns',
  description: 'List the patterns of a tool available for a repository in Codacy.',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      ...getPaginationWithSorting(
        "Field used to sort the tool's code patterns. The allowed values are 'category', 'recommended', and 'severity'"
      ),
      toolUuid: {
        type: 'string',
        description: 'Identifier of the tool',
      },
      languages: {
        type: 'string',
        description: 'List of languages to filter the patterns by, separated by commas',
      },
      categories: {
        type: 'string',
        description:
          "List of categories to filter the patterns by, separated by commas. The allowed values are 'Security', 'ErrorProne', 'CodeStyle', 'Compatibility', 'UnusedCode', and 'Performance'",
      },
      severityLevels: {
        type: 'string',
        description:
          "List of severity levels to filter the patterns by, separated by commas. The allowed values are 'Error', 'Warning', and 'Info'",
      },
      search: {
        type: 'string',
        description: 'Filter patterns searching by this string',
      },
      enabled: {
        type: 'boolean',
        description: 'Returns only the enabled or disabled patterns',
      },
      recommended: {
        type: 'boolean',
        description: 'Returns only the recommended or non-recommended patterns.',
      },
    },
    required: ['provider', 'organization', 'repository'],
  },
};
