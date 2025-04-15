import { generalOrganizationMistakes, generalRepositoryMistakes } from '../rules.js';
import { CodacyTool, fileSchema, toolNames } from '../schemas.js';

const rules = `
  Use this tool to list the duplication clones for specific file in a repository. 
  Duplication clones are code segments that are identical or very similar to other segments in the codebase.

  Common use cases: 
  - When the user asks for code duplication in a specific file
  - When the user wants to identify repeated code segments
  - When investigating potential refactoring opportunities

  Common mistakes: 
  - Using this tool for listing general code quality issues
  - Using this tool for listing security issues
  - Using this with a wrong fileId (validate the fileId with the codacy_list_files tool)
  ${generalOrganizationMistakes}
  ${generalRepositoryMistakes}
`;

export const getFileClonesTool: CodacyTool = {
  name: toolNames.CODACY_GET_FILE_CLONES,
  description: `Get the list of duplication clones for a file in a repository. \n ${rules}`,
  inputSchema: {
    type: 'object',
    properties: {
      ...fileSchema,
    },
    required: ['provider', 'organization', 'repository'],
  },
};
