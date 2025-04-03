import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { repositorySchema } from '../utils.js';

export const getIssueTool: Tool = {
  name: 'codacy_get_issue',
  description: 'Returns information about an open issue that Codacy found in a repository.',
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      issueId: {
        type: 'string',
        description: 'Issue ID',
      },
    },
    required: ['provider', 'organization', 'repository'],
  },
};
