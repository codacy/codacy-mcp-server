import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const cliInstallTool: Tool = {
  name: 'codacy_cli_install',
  description: 'Install and configure the Codacy CLI',
  inputSchema: {
    type: 'object',
    properties: {
        targetFolder: {
            type: 'string',
            description: 'The absolute path to the folder to install the Codacy CLI'
        },
        alias: {
            type: 'string',
            description: 'The alias to use for the Codacy CLI',
            default: 'codacy-cli'
        },
        token: {
            type: 'string',
            description: 'The Codacy account token',
            default: 'codacy-cli'
        }
    },
  },
}; 