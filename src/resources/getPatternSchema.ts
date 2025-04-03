export const getPatternSchema = {
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
};
