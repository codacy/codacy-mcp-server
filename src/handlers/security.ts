import { SecurityService } from '../api/client/index.js';

export const searchSecurityItemsHandler = async (args: any) => {
  const { provider, organization, cursor, limit, sort, direction, body } = args;

  return await SecurityService.searchSecurityItems(
    provider,
    organization,
    cursor,
    limit,
    sort,
    direction,
    body
  );
};
