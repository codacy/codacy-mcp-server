import { generalOrganizationMistakes, generalRepositoryMistakes } from '../rules.js';
import { CodacyTool, repositorySchema, toolNames } from '../schemas.js';

const availableCliTools = ['eslint', 'pmd', 'trivy', 'pylint', 'dartanalyzer'];

const rules = `
  Use this tool to analyze the quality of a repository using Codacy command line.

  Common use cases: 
  - When the user asks for an analysis of a repository
  - When the user asks to scan the code
  - When the user wants to analyze based on Codacy configuration
  - When the user wants to apply fixes based on Codacy configuration and analysis
  - When the user wants Codacy results immediately without waiting for the next scheduled analysis

  Common mistakes: 
  - Using this tool to know the status of a repository
  - Using this tool without specifying the rootPath
  - Using this tool to know current results from Codacy. Use ${toolNames.CODACY_GET_REPOSITORY_WITH_ANALYSIS} instead.
  - Filling the tool parameter when not asked specifically for it.
  ${generalOrganizationMistakes}
  ${generalRepositoryMistakes}
`;

const optionalRepositorySchema = { ...repositorySchema };
optionalRepositorySchema.provider.description = `Optional. ${repositorySchema.provider.description}`;
optionalRepositorySchema.organization.description = `Optional. ${repositorySchema.organization.description}`;
optionalRepositorySchema.repository.description = `Optional. ${repositorySchema.repository.description}`;

export const cliAnalyzeTool: CodacyTool = {
  name: toolNames.CODACY_CLI_ANALYZE,
  description: `Run quality analysis locally using Codacy CLI. \n ${rules}`,
  inputSchema: {
    type: 'object',
    properties: {
      ...optionalRepositorySchema,
      rootPath: {
        type: 'string',
        description:
          'Root path to the project or repository in the local filesystem. This must be filled to ensure permissions are met for the tool to run.',
      },
      file: {
        type: 'string',
        description:
          'Optional. Absolute path to the file to analyze, or directory to analyze (e.g., "src/"). If left empty, the analysis will be executed for the whole project.',
        default: '',
      },
      tool: {
        type: 'string',
        description: `Optional. Tool to use for the analysis. If left empty, it will use all available tools. Possible values: ${availableCliTools.join(', ')}`,
        default: '',
      },
    },
    required: ['rootPath'],
  },
};
