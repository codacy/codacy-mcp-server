import { AccountService, OrganizationService, RepositoryService } from '../api/client/index.js';

const findOrganization = async (provider: string, organization: string, cursor?: string) => {
  try {
    const { data: orgs, pagination } = await AccountService.listOrganizations(
      provider,
      cursor,
      100
    );
    const existingOrg = orgs.find(org => org.name === organization && org.provider === provider);
    if (!existingOrg) {
      if (pagination?.cursor === null) {
        return {
          success: false,
          message: 'Organization not found',
        };
      }
      return findOrganization(provider, organization, pagination?.cursor);
    }
    return {
      success: true,
      organization: existingOrg,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to find organization: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

const addOrganization = async (args: any) => {
  const { provider, organization } = args;
  const findOrgResult = await findOrganization(provider, organization);
  if (!findOrgResult.success) {
    return findOrgResult;
  }
  const { organization: existingOrg } = findOrgResult;

  if (existingOrg?.joinStatus === 'member') {
    return {
      success: true,
      message: `Organization already added to Codacy: ${JSON.stringify(existingOrg)}`,
    };
  }
  if (existingOrg?.joinStatus === 'pendingMember') {
    return {
      success: false,
      message: 'Waiting for join request to be approved',
    };
  }
  if (existingOrg?.joinStatus === 'remoteMember') {
    if (existingOrg.identifier) {
      try {
        await OrganizationService.joinOrganization(provider, organization);
      } catch (error) {
        return {
          success: false,
          message: `Failed to join organization: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    } else {
      await OrganizationService.addOrganization({
        provider,
        remoteIdentifier: existingOrg.remoteIdentifier,
        name: organization,
        type: existingOrg.type,
      });
      return {
        success: true,
        message: 'Organization added to Codacy',
      };
    }
  }
  return {
    success: false,
    message: 'Organization not found',
  };
};

export const setupRepositoryHandler = async (args: any) => {
  const { provider, organization, repository } = args;
  const repositoryFullPath = `${organization}/${repository}`;

  const addOrgResult = await addOrganization({ provider, organization });
  if (!addOrgResult.success) {
    return addOrgResult;
  }

  const { data: orgData } = await OrganizationService.getOrganization(provider, organization);
  const isAdmin = orgData.membership.userRole === 'admin';
  const { data } = await OrganizationService.listOrganizationRepositories(
    provider,
    organization,
    undefined,
    10,
    repository,
    'NotSynced'
  );
  const remoteRepository = data.find(repo => repo.fullPath === repositoryFullPath);
  if (!remoteRepository) {
    return {
      success: false,
      message: `Repository not found`,
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
          message: `Failed to follow repository: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    await RepositoryService.addRepository({ provider, repositoryFullPath });
    return {
      success: true,
      message: 'Repository added to Codacy',
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message: `Failed to add repository: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};
