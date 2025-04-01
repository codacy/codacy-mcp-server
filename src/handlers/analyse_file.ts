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

export const getRepositoryPullRequestHandler = async (args: any) => {
  const { provider, organization, repository, pullRequestNumber } = args;

  return await AnalysisService.getRepositoryPullRequest(
    provider,
    organization,
    repository,
    pullRequestNumber
  );
};

export const getIssueHandler = async (args: any) => {
  const { provider, organization, repository, issueId } = args;

  return await AnalysisService.getIssue(provider, organization, repository, issueId);
};

export const listRepositoryToolsHandler = async (args: any) => {
  const { provider, organization, repository } = args;

  return await AnalysisService.listRepositoryTools(provider, organization, repository);
};

export const listRepositoryToolPatternsHandler = async (args: any) => {
  const {
    provider,
    organization,
    repository,
    toolUuid,
    languages,
    categories,
    severityLevels,
    search,
    enabled,
    recommended,
    sort,
    direction,
    cursor,
    limit,
  } = args;

  return await AnalysisService.listRepositoryToolPatterns(
    provider,
    organization,
    repository,
    toolUuid,
    languages,
    categories,
    severityLevels,
    search,
    enabled,
    recommended,
    sort,
    direction,
    cursor,
    limit
  );
};
