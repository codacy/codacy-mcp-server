import {
  organizationSecurityScanTypes,
  repositorySecurityScanTypes,
  securityCategories,
  securityStatuses,
} from '../utils.js';
import {
  CodacyTool,
  getPaginationWithSorting,
  organizationSchema,
  repositorySchema,
  toolNames,
} from '../schemas.js';
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
  - Calling this tool after editing files to check for new results; changes need to be committed to the repository first.
  ${generalOrganizationMistakes}
`;

const commonSrmProperties = {
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
};

export const searchOrganizationSecurityItemsTool: CodacyTool = {
  name: toolNames.CODACY_LIST_ORGANIZATION_SRM_ITEMS,
  description: `Primary tool to list security items/issues/vulnerabilities/findings, results are related to the organization's security and risk management (SRM) dashboard on Codacy. This tool contains pagination. Returns comprehensive security analysis including ${Object.keys(organizationSecurityScanTypes).join(', ')} security issues.
  \n ${rules}`,
  inputSchema: {
    type: 'object',
    properties: {
      ...organizationSchema,
      ...getPaginationWithSorting('Sort SRM items by. Accepted values: Status, DetectedAt'),
      options: {
        type: 'object',
        description:
          'Search parameters to filter the metrics of the security issues dashboard of an organization',
        properties: {
          ...commonSrmProperties,
          scanTypes: {
            description: 'Array of security scan types to filter by.',
            type: 'array',
            items: {
              type: 'string',
              enum: Object.keys(organizationSecurityScanTypes),
            },
          },
        },
      },
    },
    required: ['provider', 'organization'],
  },
};

export const searchRepositorySecurityItemsTool: CodacyTool = {
  name: toolNames.CODACY_LIST_REPOSITORY_SRM_ITEMS,
  description: `Tool to list security items/issues/vulnerabilities/findings, results are related to a repository's security and risk management (SRM) dashboard on Codacy. This tool contains pagination. Returns comprehensive security analysis including ${Object.keys(repositorySecurityScanTypes).join(', ')} security issues.
  \n ${rules}
  \n ${generalRepositoryMistakes}
  - Using this tool for DAST and PenTesting scan types; use the codacy_search_organization_srm_items tool instead.`,
  inputSchema: {
    type: 'object',
    properties: {
      ...repositorySchema,
      ...getPaginationWithSorting('Sort SRM items by. Accepted values: Status, DetectedAt'),
      options: {
        type: 'object',
        description:
          'Search parameters to filter the metrics of the security issues dashboard of an organization',
        properties: {
          ...commonSrmProperties,
          scanTypes: {
            description: 'Array of security scan types to filter by.',
            type: 'array',
            items: {
              type: 'string',
              enum: Object.keys(repositorySecurityScanTypes),
            },
          },
        },
      },
    },
    required: ['provider', 'organization', 'repository'],
  },
};
