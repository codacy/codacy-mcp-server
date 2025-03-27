import { AnalysisService } from '../api/client/index.js';

export const listPullRequestIssuesHandler = async (args: any) => {
  const {
    provider,
    organization,
    repository,
    pullRequestNumber,
    status,
    onlyPotential,
    cursor,
    limit,
  } = args;

  return await AnalysisService.listPullRequestIssues(
    provider,
    organization,
    repository,
    pullRequestNumber,
    status,
    onlyPotential,
    cursor,
    limit
  );
};

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

export const getRepositoryWithAnalysisHandler = async (args: any) => {
  const { provider, organization, repository, branch } = args;

  return await AnalysisService.getRepositoryWithAnalysis(
    provider,
    organization,
    repository,
    branch
  );
};
