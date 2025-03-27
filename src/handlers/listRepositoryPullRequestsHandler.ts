import { AnalysisService } from '../api/client/index.js';

export const listRepositoryPullRequestsHandler = async (args: any) => {
  const { provider, organization, repository, search, includeNotAnalyzed, cursor, limit } = args;
  return await AnalysisService.listRepositoryPullRequests(
    provider,
    organization,
    repository,
    limit,
    cursor,
    search,
    includeNotAnalyzed
  );
};
