import { generalOrganizationMistakes, generalRepositoryMistakes } from '../rules.js';
import { listFilesTool } from './listFilesTool.js';
import { CodacyTool, defaultPagination, fileSchema, toolNames } from '../schemas.js';

const rules = `
  Use this tool to list the issues for specific files in a repository. 

  Common use cases: 
  - When the user asks for the issues for a specific file
  - When the user is in a file context and asks for the issues
  - When the user asks if a specific file has issues

  Common mistakes: 
  - Using this tool for listing the issues for specific pull requests
  - Using this tool for listing the issues for an entire repository
  - Using this with a wrong fileId (validate the fileId with the ${listFilesTool.name} tool)
  ${generalOrganizationMistakes}
  ${generalRepositoryMistakes}
`;

export const listFileIssuesTool: CodacyTool = {
  name: toolNames.CODACY_GET_FILE_ISSUES,
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
