import { OrganizationService } from '../api/client/index.js';

export const listOrganizationRepositoriesHandler = async (args: any) => {
  const { provider, organization, limit, cursor } = args;

  return await OrganizationService.listOrganizationRepositories(
    provider,
    organization,
    cursor,
    limit
  );
};

export const addOrganizationHandler = async (args: any) => {
  const { provider, remoteIdentifier, name, type } = args;

  return await OrganizationService.addOrganization({ provider, remoteIdentifier, name, type });
};
