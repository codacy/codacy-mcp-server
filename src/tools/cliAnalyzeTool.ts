import { generalOrganizationMistakes, generalRepositoryMistakes } from '../rules.js';
import { CodacyTool, repositorySchema, toolNames } from '../schemas.js';

const rules = `
  Use this tool to analyze the quality of a repository using Codacy command line.

  Common use cases: 
  - When the user asks for an analysis of a repository
  - When the user wants to analyze based on Codacy configuration
  - When the user wants to apply fixes based on Codacy configuration and analysis
  - When the user wants Codacy results immediately without waiting for the next scheduled analysis

  Common mistakes: 
  - Using this tool to know the status of a repository
  - Using this tool without specifying the rootPath
  - Using this tool to know current results from Codacy. Use ${toolNames.CODACY_GET_REPOSITORY_WITH_ANALYSIS} instead.
  ${generalOrganizationMistakes}
  ${generalRepositoryMistakes}
`;

export const cliAnalyzeTool: CodacyTool = {
  name: toolNames.CODACY_CLI_ANALYZE,
  description: `Run quality analysis using Codacy CLI. \n ${rules}`,
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      rootPath: {
        type: 'string',
        description:
          'Root path to the project or repository in the local filesystem. This must be filled to ensure permissions are met for the tool to run.',
      },
      file: {
        type: 'string',
        description:
          'Optional. Absolute path to the file to analyze, or pattern to match files (e.g., "src/**/*.js"). If left empty, the analysis will be executed for the whole project.',
        default: '',
      },
    },
    required: ['provider', 'organization', 'repository', 'rootPath'],
  },
};
