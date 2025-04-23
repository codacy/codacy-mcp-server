import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const toolNames = {
  CODACY_LIST_ORGANIZATION_REPOSITORIES: 'codacy_list_organization_repositories',
  CODACY_LIST_ORGANIZATION_SRM_ITEMS: 'codacy_search_organization_srm_items',
  CODACY_LIST_REPOSITORY_SRM_ITEMS: 'codacy_search_repository_srm_items',
  CODACY_LIST_REPOSITORY_ISSUES: 'codacy_list_repository_issues',
  CODACY_LIST_REPOSITORY_PULL_REQUESTS: 'codacy_list_repository_pull_requests',
  CODACY_LIST_FILES: 'codacy_list_files',
  CODACY_LIST_REPOSITORY_TOOL_PATTERNS: 'codacy_list_repository_tool_patterns',
  CODACY_LIST_REPOSITORY_TOOLS: 'codacy_list_repository_tools',
  CODACY_LIST_TOOLS: 'codacy_list_tools',
  CODACY_LIST_ORGANIZATIONS: 'codacy_list_organizations',
  CODACY_GET_FILE_ISSUES: 'codacy_get_file_issues',
  CODACY_GET_FILE_COVERAGE: 'codacy_get_file_coverage',
  CODACY_GET_PULL_REQUEST_FILES_COVERAGE: 'codacy_get_pull_request_files_coverage',
  CODACY_GET_PULL_REQUEST_GIT_DIFF: 'codacy_get_pull_request_git_diff',
  CODACY_LIST_PULL_REQUEST_ISSUES: 'codacy_list_pull_request_issues',
  CODACY_GET_REPOSITORY_WITH_ANALYSIS: 'codacy_get_repository_with_analysis',
  CODACY_GET_FILE_WITH_ANALYSIS: 'codacy_get_file_with_analysis',
  CODACY_GET_REPOSITORY_PULL_REQUEST: 'codacy_get_repository_pull_request',
  CODACY_GET_ISSUE: 'codacy_get_issue',
  CODACY_GET_PATTERN: 'codacy_get_pattern',
  CODACY_CLI_ANALYZE: 'codacy_cli_analyze',
  CODACY_GET_FILE_CLONES: 'codacy_get_file_clones',
  CODACY_ADD_REPOSITORY: 'codacy_add_repository',
  CODACY_ADD_ORGANIZATION: 'codacy_add_organization',
} as const;

export type ToolKeys = (typeof toolNames)[keyof typeof toolNames];

export interface CodacyTool extends Tool {
  name: ToolKeys;
}

export const organizationSchema = {
  provider: {
    type: 'string',
    description:
      "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb. Try to extract it from the repository's git remote URL using 'git remote -v'.",
  },
  organization: {
    type: 'string',
    description:
      "Organization name or username that owns the repository on the Git provider.  Try to extract it from the repository's git remote URL using 'git remote -v' following these patterns:\n" +
      "- SSH format: 'git@github.com:{organization}/{repository}.git'\n" +
      "- HTTPS GitHub: 'https://github.com/{organization}/{repository}.git'\n" +
      "- HTTPS GitLab: 'https://gitlab.com/{organization}/{repository}.git'\n" +
      "- HTTPS BitBucket: 'https://bitbucket.org/{organization}/{repository}.git'\n" +
      'Do not use the README file to extract the organization name.',
  },
};

export const repositorySchema = {
  ...organizationSchema,
  repository: {
    type: 'string',
    description:
      "Repository name on the Git provider.  Try to extract it from the repository's git remote URL using 'git remote -v', it should be something like this for gh:'https://github.com/<owner>/<repository>.git' for gl:'https://gitlab.com/<owner>/<repository>.git' for bb:'https://bitbucket.org/<owner>/<repository>.git'.",
  },
};

export const defaultPagination = {
  cursor: {
    type: 'string',
    description: 'Pagination cursor for next page of results',
  },
  limit: {
    type: 'number',
    description: 'Maximum number of results to return (default 100, max 100)',
    default: 100,
  },
};

export const getPaginationWithSorting = (sortDescription: string) => ({
  ...defaultPagination,
  direction: {
    type: 'string',
    description:
      "Sort direction (ascending or descending). Use 'desc' to see highest values first, 'asc' for lowest values first.",
  },
  sort: {
    type: 'string',
    description: sortDescription,
  },
});

export const branchSchema = {
  branchName: {
    type: 'string',
    description:
      'Branch name, by default the main/default branch defined on the Codacy repository settings is used',
  },
};

export const fileSchema = {
  ...repositorySchema,
  fileId: {
    type: 'string',
    description: "Codacy's identifier of a file in a specific commit",
  },
};
