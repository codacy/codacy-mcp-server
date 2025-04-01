import { AccountService } from '../api/client/index.js';

export const listOrganizationsHandler = async (args: any) => {
  const { provider, cursor, limit } = args;

  return await AccountService.listOrganizations(provider, cursor, limit);
};
