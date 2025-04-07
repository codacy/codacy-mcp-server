import { toolNames } from './schemas.js';

// General rules pertaining to the accuracy of the arguments passed to the tools
export const generalOrganizationMistakes = `
  - Using this tool for a organization other than the current one
  - Using this tool with the wrong organization name (if you are not sure, use the ${toolNames.CODACY_LIST_ORGANIZATIONS} tool to validate the organization name)
`;

export const generalRepositoryMistakes = `
  - Using this tool without specifying the repository name 
  - Using this tool for a repository other than the current one
  - Using this tool with the wrong repository name (if you are not sure, use the ${toolNames.CODACY_LIST_ORGANIZATION_REPOSITORIES} tool to validate the repository name)
`;
