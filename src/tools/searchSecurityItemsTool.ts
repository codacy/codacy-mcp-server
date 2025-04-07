import { securityCategories, securityScanTypes, securityStatuses } from '../utils.js';
import { CodacyTool, getPaginationWithSorting, organizationSchema, toolNames } from '../schemas.js';
import { generalOrganizationMistakes, generalRepositoryMistakes } from '../rules.js';

const rules = `
  This tool provides advanced filtering by security categories, priorities, and scan types. Use this as the first tool when investigating security or compliance concerns. 
  Always add the current repository name in the repositories filter, unless specified otherwise. 

  How to format the response of this tool:
  - Map the results statuses as open issues: ${securityStatuses.Open.join(', ')}; and closed issues: ${securityStatuses.Closed.join(', ')}.
  - Prioritize the open issues as the most important ones in the results. 
  
  Common use cases: 
  - When the user asks for security issues
  - When the user asks form compliance concerns

  Common mistakes: 
  - Using this tool for quality issues
  ${generalOrganizationMistakes}
  ${generalRepositoryMistakes}
`;

export const searchSecurityItemsTool: CodacyTool = {
  name: toolNames.CODACY_LIST_SRM_ITEMS,
  description: `Primary tool to list security items/issues/vulnerabilities/findings, results are related to the organization security and risk management (SRM) dashboard on Codacy. This tool contains pagination. Returns comprehensive security analysis including ${Object.keys(securityScanTypes).join(', ')} security issues.
  \n ${rules}`,
  inputSchema: {
    type: 'object',
    properties: {
      ...organizationSchema,
      ...getPaginationWithSorting('Sort SRM items by. Accepted values: Status, DetectedAt'),
      body: {
        type: 'object',
        description:
          'Search parameters to filter the metrics of the security issues dashboard of an organization',
        properties: {
          repositories: {
            type: 'array',
            description: 'Use this to filter by repository name.',
            items: {
              type: 'string',
              description: 'Repository name',
            },
          },
          priorities: {
            description: 'Array of security issue priorities/severities to filter by.',
            type: 'array',
            items: {
              type: 'string',
              enum: ['Low', 'Medium', 'High', 'Critical'],
            },
          },
          statuses: {
            type: 'array',
            description:
              'Array of security issue statuses to filter by. Must be one or more of the following values:\n\nOpen issues:\n- OnTrack\n- DueSoon\n- Overdue\n\nClosed issues:\n- ClosedOnTime\n- ClosedLate\n- Ignored',
            items: {
              type: 'string',
              enum: ['OnTrack', 'DueSoon', 'Overdue', 'ClosedOnTime', 'ClosedLate', 'Ignored'],
            },
          },
          categories: {
            description: 'Array of security categories to filter by.',
            type: 'array',
            items: {
              type: 'string',
              enum: securityCategories,
            },
            note: "_other_ can be used to search for issues that don't have a security category",
          },
          scanTypes: {
            description: 'Array of security scan types to filter by.',
            type: 'array',
            items: {
              type: 'string',
              enum: Object.keys(securityScanTypes),
            },
            mapping: securityScanTypes,
          },
          segments: {
            type: 'array',
            description:
              'Set of segments ids (type number). Segment is a Codacy concept that groups repositories by different criteria',
            items: {
              type: 'number',
              description: 'Segment id',
            },
          },
        },
      },
    },
    required: ['provider', 'organization'],
  },
};
