import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const allowedTools = ['eslint', 'trivy'];

export const cliAnalyzeTool: Tool = {
  name: 'codacy_cli_analyze',
  description: 'Run analysis using Codacy CLI',
  inputSchema: {
    type: 'object',
    properties: {
      rootPath: {
        type: 'string',
        description:
          'Required. Root path to the project or repository in the local filesystem. This must be filled to ensure permissions are met for the tool to run.',
      },
      tool: {
        type: 'string',
        description: `Required. Tool to use for analysis (e.g., eslint). Possible values: ${allowedTools.join(', ')}.`,
      },
      file: {
        type: 'string',
        description:
          'Optional. Absolute path to the file to analyze, or pattern to match files (e.g., "src/**/*.js"). If left empty, the analysis will be executed for the whole project.',
        default: '',
      },
    },
  },
};
