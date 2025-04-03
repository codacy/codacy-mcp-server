import { ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
import { getPatternSchema } from './getPatternSchema.js';
import { listFilesSchema } from './listFilesSchema.js';
import { listOrganizationRepositoriesSchema } from './listOrganizationRepositoriesSchema.js';
import { listOrganizationsSchema } from './listOrganizationsSchema.js';
import { listToolsSchema } from './listToolsSchema.js';

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
}

export const resourceTemplates: CodacyResourceTemplate[] = [
  {
    name: 'Code pattern from a tool available in Codacy',
    type: 'codacy/pattern',
    description: 'Code analysis pattern available in Codacy. The pattern is part of a tool.',
    uriTemplate: 'codacy/pattern/{toolUuid}/{patternId}',
    schema: getPatternSchema,
    operations: ['read'],
  },
  {
    name: 'Code analysis tools available in Codacy',
    type: 'codacy/tools',
    description: 'Code analysis tools available in Codacy.',
    uriTemplate: 'codacy/tools',
    schema: listToolsSchema,
    operations: ['read'],
  },
  {
    name: 'Codacy organizations',
    type: 'codacy/organizations',
    description: 'Codacy organizations.',
    uriTemplate: 'codacy/organizations/{provider}',
    schema: listOrganizationsSchema,
    operations: ['list'],
  },
  {
    name: 'Codacy repositories',
    type: 'codacy/repositories',
    description: 'Codacy repositories.',
    uriTemplate: 'codacy/repositories/{provider}/{organization}',
    schema: listOrganizationRepositoriesSchema,
    operations: ['list'],
  },
  {
    name: 'Files in a branch from a repository analyzed by Codacy',
    type: 'codacy/files',
    description: 'Files in a branch from a repository analyzed by Codacy.',
    uriTemplate: 'codacy/files/{provider}/{organization}/{repository}/{branch}',
    schema: listFilesSchema,
    operations: ['list'],
  },
];
