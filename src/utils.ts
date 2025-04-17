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

export const repositorySecurityScanTypes = {
  SAST: 'Code scanning',
  Secrets: 'Secret scanning',
  SCA: 'Dependency scanning',
  IaC: 'Infrastructure-as-code scanning',
  CICD: 'CI/CD scanning',
};

export const organizationSecurityScanTypes = {
  ...repositorySecurityScanTypes,
  DAST: 'Dynamic Application Security Testing',
  PenTesting: 'Penetration testing',
};

export const extractOrganizationFromUrl = (url: string): string | null => {
  const patterns = [
    /git@github\.com:([^/]+)\/[^/]+\.git$/,
    /https:\/\/github\.com\/([^/]+)\/[^/]+\.git$/,
    /https:\/\/gitlab\.com\/([^/]+)\/[^/]+\.git$/,
    /https:\/\/bitbucket\.org\/([^/]+)\/[^/]+\.git$/,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(url);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
};

// Helper function to parse URI based on template
export const parseUri = (uri: string, template: string): Record<string, string> | null => {
  const templateParts = template.split('/');
  const uriParts = uri.split('/');

  if (templateParts.length !== uriParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < templateParts.length; i++) {
    const templatePart = templateParts[i];
    const uriPart = uriParts[i];

    if (templatePart.startsWith('{') && templatePart.endsWith('}')) {
      // This is a parameter
      const paramName = templatePart.slice(1, -1);
      params[paramName] = uriPart;
    } else if (templatePart !== uriPart) {
      // Static parts must match exactly
      return null;
    }
  }

  return params;
};
