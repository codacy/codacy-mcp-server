import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const installCLITool: Tool = {
  name: 'codacy_install_cli',
  description: 'Install and configure the Codacy CLI',
  inputSchema: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'The Codacy account token',
      },
    },
  },
};
