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
  provider: {
    type: 'string',
    description:
      "Organization's git provider: GitHub (gh), GitLab (gl) or BitBucket (bb). Accepted values: gh, gl, bb. In case a repository is given, use that repository's Git provider.",
  },
  organization: {
    type: 'string',
    description:
      "Organization name on the Git provider. In case a repository is given, use that repository's owner (could be an organization name or username).",
  },
};

export const repositorySchema = {
  ...organizationSchema,
  repository: {
    type: 'string',
    description: 'Repository name on the Git provider',
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
    description: 'Sort direction (ascending or descending). Accepted values: asc, desc',
  },
  sort: {
    type: 'string',
    description: sortDescription,
  },
});
