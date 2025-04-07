import { CodacyTool, toolNames } from '../schemas.js';

export const getPatternTool: CodacyTool = {
  name: toolNames.CODACY_GET_PATTERN,
  description: 'Get the definition of a specific pattern.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      toolUuid: {
        type: 'string',
        description: 'The identifier of the tool that the pattern belongs to.',
      },
      patternId: {
        type: 'string',
        description: 'Pattern identifier',
      },
    },
    required: ['toolUuid', 'patternId'],
  },
};
