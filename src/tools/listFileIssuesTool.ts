import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { generalOrganizationMistakes, generalRepositoryMistakes } from '../utils.js';
import { listFilesTool } from './listFilesTool.js';
import { defaultPagination, fileSchema } from '../schemas.js';

const rules = `
  Use this tool to list the issues for specific files in a repository. 

  Common use cases: 
  - When the user asks for the issues for a specific file
  - When the user is in a file context and asks for the issues

  Common mistakes: 
  - Using this tool for listing the issues for specific pull requests
  - Using this tool for listing the issues for an entire repository
  - Using this with a wrong fileId (validate the fileId with the ${listFilesTool.name} tool)
  ${generalOrganizationMistakes}
  ${generalRepositoryMistakes}
`;

export const listFileIssuesTool: Tool = {
  name: 'codacy_get_file_issues',
  description: `Get the issue list for a file in a repository. \n ${rules}`,
  inputSchema: {
    type: 'object',
    properties: {
      ...fileSchema,
      ...defaultPagination,
    },
    required: ['provider', 'organization', 'repository'],
  },
};
