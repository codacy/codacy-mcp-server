import { ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
import { getPatternHandler, listToolsHandler } from '../handlers/tools.js';
import { listOrganizationsHandler } from '../handlers/account.js';
import { listOrganizationRepositoriesHandler } from '../handlers/organization.js';
import { listFilesHandler } from '../handlers/repository.js';
import {
  organizationSchema,
  repositorySchema,
  getPatternSchema,
  listFilesSchema,
  listOrganizationRepositoriesSchema,
  listOrganizationsSchema,
  listToolsSchema,
} from '../schemas.js';
export type CodacyResourceType =
  | 'codacy/pattern'
  | 'codacy/tools'
  | 'codacy/organizations'
  | 'codacy/repositories'
  | 'codacy/files';

interface CodacyResourceTemplate extends ResourceTemplate {
  type: CodacyResourceType;
  schema: any;
  operations: string[];
  handler: (args: any) => Promise<any>;
}

export const resourceTemplates: CodacyResourceTemplate[] = [
  {
    name: 'Code pattern from a tool available in Codacy',
    type: 'codacy/pattern',
    description: 'Code analysis pattern available in Codacy. The pattern is part of a tool.',
    uriTemplate: 'codacy/pattern/{toolUuid}/{patternId}',
    parameters: {
      type: 'object',
      properties: {
        toolUuid: {
          type: 'string',
          description: 'The UUID of the tool.',
        },
        patternId: {
          type: 'string',
          description: 'The ID of the pattern.',
        },
      },
    },
    schema: getPatternSchema,
    operations: ['read'],
    handler: getPatternHandler,
  },
  {
    name: 'Code analysis tools available in Codacy',
    type: 'codacy/tools',
    description: 'Code analysis tools available in Codacy.',
    uriTemplate: 'codacy/tools',
    schema: listToolsSchema,
    operations: ['read'],
    handler: listToolsHandler,
  },
  {
    name: 'Codacy organizations',
    type: 'codacy/organizations',
    description: 'Codacy organizations.',
    uriTemplate: 'codacy/organizations/{provider}',
    parameters: {
      type: 'object',
      properties: {
        provider: organizationSchema.provider,
      },
    },
    schema: listOrganizationsSchema,
    operations: ['list'],
    handler: listOrganizationsHandler,
  },
  {
    name: 'Codacy repositories',
    type: 'codacy/repositories',
    description: 'Codacy repositories.',
    uriTemplate: 'codacy/repositories/{provider}/{organization}',
    parameters: {
      type: 'object',
      properties: {
        ...organizationSchema,
      },
    },
    schema: listOrganizationRepositoriesSchema,
    operations: ['list'],
    handler: listOrganizationRepositoriesHandler,
  },
  {
    name: 'Files in a branch from a repository analyzed by Codacy',
    type: 'codacy/files',
    description: 'Files in a branch from a repository analyzed by Codacy.',
    uriTemplate: 'codacy/files/{provider}/{organization}/{repository}/{branch}',
    parameters: {
      type: 'object',
      properties: {
        ...repositorySchema,
        branch: {
          type: 'string',
          description: 'The branch of the repository to list files from.',
        },
      },
    },
    schema: listFilesSchema,
    operations: ['list'],
    handler: listFilesHandler,
  },
];
