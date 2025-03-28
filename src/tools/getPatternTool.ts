import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getPatternTool: Tool = {
  name: 'codacy_get_pattern',
  description: 'Get the definition of a specific pattern.',
  inputSchema: {
    type: 'object',
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
  },
};
