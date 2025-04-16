import { generalOrganizationMistakes, generalRepositoryMistakes } from '../rules.js';
import { CodacyTool, repositorySchema, toolNames } from '../schemas.js';

const rules = `
  Common use cases: 
  - When the user asks for the coverage of the files in a specific pull request
  
  Common mistakes: 
  - Using this tool for a specific file. For specific file coverage, use the ${toolNames.CODACY_GET_FILE_WITH_ANALYSIS} tool instead.
  ${generalOrganizationMistakes}
  ${generalRepositoryMistakes}
`;

export const getRepositoryPullRequestFilesCoverageTool: CodacyTool = {
  name: toolNames.CODACY_GET_REPOSITORY_PULL_REQUEST_FILES_COVERAGE,
  description: `Use this tool to get coverage information for all files in a pull request. \n ${rules}`,
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      pullRequestNumber: {
        type: 'number',
        description: 'Pull request number',
      },
    },
    required: ['provider', 'organization', 'repository'],
  },
};
