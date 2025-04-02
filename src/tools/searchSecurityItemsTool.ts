import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  getPaginationWithSorting,
  organizationSchema,
  securityCategories,
  securityScanTypes,
  securityStatuses,
} from './utils.js';

export const searchSecurityItemsTool: Tool = {
  name: 'codacy_list_srm_items',
  description: `Primary tool to list security items/issues/vulnerabilities/findings, results are related to the organization security and risk management (SRM) dashboard on Codacy. This tool contains pagination. Returns comprehensive security analysis including ${Object.keys(securityScanTypes).join(', ')} security issues. Provides advanced filtering by security categories, priorities, and scan types. Use this as the first tool when investigating security or compliance concerns. Always add the current repository name in the repositories filter, unless specified otherwise. Map the results statuses as open issues: ${securityStatuses.Open.join(', ')}; and closed issues: ${securityStatuses.Closed.join(', ')}. Prioritize the open issues as the most important ones in the results. To get the SRM items for a specific repository, use the repository name in body object.`,
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
            }
          },
        },
      },
    },
    required: ['provider', 'organization'],
  },
};
