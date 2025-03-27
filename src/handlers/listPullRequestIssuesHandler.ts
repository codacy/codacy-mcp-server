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
