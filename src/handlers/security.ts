import { SecurityService } from '../api/client/index.js';

export const searchSecurityItemsHandler = async (args: any) => {
  const { provider, organization, cursor, limit, sort, direction, options } = args;

  return await SecurityService.searchSecurityItems(
    provider,
    organization,
    cursor,
    limit,
    sort,
    direction,
    options
  );
};

export const searchRepositorySecurityItemsHandler = async (args: any) => {
  const { provider, organization, repository, cursor, limit, sort, direction, options } = args;

  options.repositories = [repository];

  return await SecurityService.searchSecurityItems(
    provider,
    organization,
    cursor,
    limit,
    sort,
    direction,
    options
  );
};
