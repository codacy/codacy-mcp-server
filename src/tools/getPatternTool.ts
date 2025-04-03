import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getPatternSchema } from '../resources/getPatternSchema.js';

export const getPatternTool: Tool = {
  name: 'codacy_get_pattern',
  description: 'Get the definition of a specific pattern.',
  inputSchema: getPatternSchema,
};
