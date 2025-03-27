import { RepositoryService } from '../api/client/index.js';

export const getFileWithAnalysisHandler = async (args: any) => {
  const { provider, organization, repository, fileId } = args;

  return await RepositoryService.getFileWithAnalysis(provider, organization, repository, fileId);
};

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

export const getFileCoverageHandler = async (args: any) => {
  const { provider, organization, repository, fileId } = args;

  return await RepositoryService.getFileCoverage(provider, organization, repository, fileId);
};

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
