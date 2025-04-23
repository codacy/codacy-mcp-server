import { OrganizationService, RepositoryService } from '../api/client/index.js';

export const addRepositoryHandler = async (args: any) => {
  const { provider, organization, repository } = args;
  const repositoryFullPath = `${organization}/${repository}`;
  const { data: orgData } = await OrganizationService.getOrganization(provider, organization);
  const isAdmin = orgData.membership.userRole === 'admin';
  const { data } = await OrganizationService.listOrganizationRepositories(provider, organization);
  const remoteRepository = data.find(repo => repo.fullPath === repositoryFullPath);
  if (!remoteRepository) {
    return {
      success: false,
      message: 'Repository not found',
    };
  }
  if (remoteRepository?.addedState === 'Added') {
    if (!isAdmin) {
      try {
        await RepositoryService.followAddedRepository(provider, organization, repository);
        return {
          success: true,
          message: 'Repository followed',
        };
      } catch (error) {
        return {
          success: false,
          error: error,
          message: 'Failed to follow repository',
        };
      }
    }
    return {
      success: true,
      message: 'Repository is already added to Codacy',
    };
  }
  if (remoteRepository?.addedState === 'Following') {
    return {
      success: true,
      message: 'Repository is already being followed',
    };
  }
  try {
    await RepositoryService.addRepository(provider, repositoryFullPath);
    return {
      success: true,
      message: 'Repository added to Codacy',
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message: 'Failed to add repository',
    };
  }
};
