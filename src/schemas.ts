export const organizationSchema = {
  gitUrl: {
    type: 'string',
    description: "Git URL of the repository. Get the git url using 'git remote -v'",
  },
  provider: {
    type: 'string',
    description:
      "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb. In case a repository is given, use that repository's Git provider. ",
  },
  organization: {
    type: 'string',
    description:
      "Organization name or username that owns the repository on the Git provider. This should only be extracted from the repository's git remote URL using these patterns:\n" +
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
      "Repository name on the Git provider. To find the repository name check the repository git url, it should be something like this for gh:'https://github.com/<owner>/<repository>.git' for gl:'https://gitlab.com/<owner>/<repository>.git' for bb:'https://bitbucket.org/<owner>/<repository>.git'.",
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

// Specific schemas for tools

export const listToolsSchema = {
  type: 'object' as const,
  properties: {
    ...defaultPagination,
  },
};

export const listOrganizationsSchema = {
  type: 'object' as const,
  properties: {
    provider: organizationSchema.provider,
    ...defaultPagination,
  },
};

export const listOrganizationRepositoriesSchema = {
  type: 'object' as const,
  properties: {
    ...organizationSchema,
    ...defaultPagination,
  },
  required: ['provider', 'organization'],
};

export const listFilesSchema = {
  type: 'object' as const,
  properties: {
    ...repositorySchema,
    ...getPaginationWithSorting(
      "Field used to sort the list of files. The allowed values are 'filename', 'issues', 'grade', 'duplication', 'complexity', and 'coverage'."
    ),
    branch: {
      type: 'string',
      description: 'Name of a repository branch enabled on Codacy',
    },
    search: {
      type: 'string',
      description: 'Filter files that include this string anywhere in their relative path',
    },
  },
  required: ['provider', 'organization', 'repository'],
};

export const getPatternSchema = {
  type: 'object' as const,
  properties: {
    toolUuid: {
      type: 'string',
      description: 'The identifier of the tool that the pattern belongs to.',
    },
    patternId: {
      type: 'string',
      description: 'Pattern identifier',
    },
  },
  required: ['toolUuid', 'patternId'],
};
