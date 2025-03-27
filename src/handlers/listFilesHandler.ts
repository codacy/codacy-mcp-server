import { RepositoryService } from '../api/client/index.js';

export const listFilesHandler = async (args: any) => {
  const { provider, organization, repository, branch, search, sort, direction, cursor, limit } =
    args;
  return await RepositoryService.listFiles(
    provider,
    organization,
    repository,
    branch,
    search,
    sort,
    direction,
    cursor,
    limit
  );
};
