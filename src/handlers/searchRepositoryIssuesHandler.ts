import { AnalysisService } from '../api/client/index.js';

export const searchRepositoryIssuesHandler = async (args: any) => {
  const { provider, organization, repository, limit, cursor, body } = args;

  return await AnalysisService.searchRepositoryIssues(
    provider,
    organization,
    repository,
    cursor,
    limit,
    body
  );
};
