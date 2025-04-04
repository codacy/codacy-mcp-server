import { extractOrganizationFromUrl } from '../utils.js';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateOrganization = (args: any) => {
  if (!args.organization) {
    throw new ValidationError('Organization name is required');
  }

  if (!args.provider) {
    throw new ValidationError('Provider is required');
  }

  // Validate provider
  if (!['gh', 'gl', 'bb'].includes(args.provider)) {
    throw new ValidationError('Invalid provider. Must be one of: gh, gl, bb');
  }

  // If a git URL is provided, validate organization matches
  if (args.gitUrl) {
    const extractedOrg = extractOrganizationFromUrl(args.gitUrl);
    if (extractedOrg && extractedOrg !== args.organization) {
      throw new ValidationError(
        `Organization name '${args.organization}' does not match the organization in the git URL: '${extractedOrg}'`
      );
    }
  }

  return args;
};
