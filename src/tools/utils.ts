export const codacyLanguages = [
  'C',
  'CPP',
  'CSharp',
  'Java',
  'Go',
  'Kotlin',
  'Ruby',
  'Scala',
  'Dart',
  'Python',
  'TypeScript',
  'Javascript',
  'CoffeeScript',
  'Swift',
  'JSP',
  'VisualBasic',
  'PHP',
  'PLSQL',
  'SQL',
  'TSQL',
  'Crystal',
  'Haskell',
  'Elixir',
  'Groovy',
  'Apex',
  'VisualForce',
  'Velocity',
  'CSS',
  'HTML',
  'LESS',
  'SASS',
  'Dockerfile',
  'Terraform',
  'Shell',
  'Powershell',
  'JSON',
  'XML',
  'YAML',
  'Markdown',
  'Cobol',
  'ABAP',
  'ObjectiveC',
  'Rust',
];

export const issueCategories = [
  'security',
  'errorprone',
  'performance',
  'complexity',
  'unusedcode',
  'comprehensibility',
  'compatibility',
  'bestpractice',
  'codestyle',
  'documentation',
];

export const securityStatuses = {
  Open: ['OnTrack', 'DueSoon', 'Overdue'],
  Closed: ['ClosedOnTime', 'ClosedLate', 'Ignored'],
};

export const securityCategories = [
  'Auth',
  'CommandInjection',
  'Cookies',
  'Cryptography',
  'CSRF',
  'DoS',
  'FileAccess',
  'HTTP',
  'InputValidation',
  'InsecureModulesLibraries',
  'InsecureStorage',
  'Other',
  'Regex',
  'SQLInjection',
  'UnexpectedBehaviour',
  'Visibility',
  'XSS',
  '_other_',
];

export const securityScanTypes = {
  SAST: 'Code scanning',
  Secrets: 'Secret scanning',
  SCA: 'Dependency scanning',
  IaC: 'Infrastructure-as-code scanning',
  CICD: 'CI/CD scanning',
  DAST: 'Dynamic Application Security Testing',
  PenTesting: 'Penetration testing',
};

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

export const extractOrganizationFromUrl = (url: string): string | null => {
  const patterns = [
    /git@github\.com:([^/]+)\/[^/]+\.git$/,
    /https:\/\/github\.com\/([^/]+)\/[^/]+\.git$/,
    /https:\/\/gitlab\.com\/([^/]+)\/[^/]+\.git$/,
    /https:\/\/bitbucket\.org\/([^/]+)\/[^/]+\.git$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};
