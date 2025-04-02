import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const CLIanalysisTool: Tool = {
  name: 'codacy_cli_analysis',
  description: 'Run analysis using Codacy CLI',
  inputSchema: {
    type: 'object',
    properties: {
      tool: {
        type: 'string',
        description: 'Tool to use for analysis (e.g., eslint)',
        default: 'eslint',
      },
      format: {
        type: 'string',
        description: 'Output format (e.g., sarif)',
        default: 'sarif',
      },
      output: {
        type: 'string',
        description: 'Output file path',
        default: 'results.sarif',
      },
    },
  },
};
