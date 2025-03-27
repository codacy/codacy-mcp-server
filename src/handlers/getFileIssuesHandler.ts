import { RepositoryService } from '../api/client/index.js';

export const getFileIssuesHandler = async (args: any) => {
  const { provider, organization, repository, fileId, limit, cursor } = args;

  return await RepositoryService.getFileIssues(
    provider,
    organization,
    repository,
    fileId,
    cursor,
    limit
  );
};
