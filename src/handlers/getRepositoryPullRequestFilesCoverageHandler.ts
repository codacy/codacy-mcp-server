import { CoverageService } from '../api/client/index.js';

export const getRepositoryPullRequestFilesCoverageHandler = async (args: any) => {
  const { provider, organization, repository, pullRequestNumber } = args;
  return await CoverageService.getRepositoryPullRequestFilesCoverage(
    provider,
    organization,
    repository,
    pullRequestNumber
  );
};
