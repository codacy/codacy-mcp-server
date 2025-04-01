import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const installCLITool: Tool = {
  name: 'codacy_install_cli',
  description: 'Install and configure the Codacy CLI',
  inputSchema: {
    type: 'object',
    properties: {
        path: {
            type: 'string',
            description: 'The path to install the CLI to. Usually it is in the root directory of a project.',
        }
    },
  },
};