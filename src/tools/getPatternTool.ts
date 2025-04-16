import { CodacyTool, toolNames } from '../schemas.js';

const rules = `
  Common use cases: 
  - When the user asks for the definition of a specific pattern
  - When the user asks for more information about an issue found by Codacy

  Common mistakes: 
  - Using this tool with the wrong toolUuid
  - Using this tool with the wrong patternId
`;

export const getPatternTool: CodacyTool = {
  name: toolNames.CODACY_GET_PATTERN,
  description: `Get the definition of a specific pattern. \n ${rules}`,
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
    required: ['toolUuid', 'patternId'],
  },
};
