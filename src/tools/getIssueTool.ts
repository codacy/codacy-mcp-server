import { CodacyTool, repositorySchema, toolNames } from '../schemas.js';

export const getIssueTool: CodacyTool = {
  name: toolNames.CODACY_GET_ISSUE,
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
