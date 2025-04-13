import { TokenResponseDto } from '../../dto/common/TokenResponseDto';
import { UserSignupDto } from '../../dto/users';
import { AuthServiceClient } from '../api/AuthServiceClient';
import { updateOrCreateUser } from '../dao/userDao';
import { parseJwtToken } from '../../auth/jwt';
import { OrganizationDto, OrganizationsListDto } from '../../dto/organizations';
import { updateOrCreateOrganization } from '../dao/organizationDao';
import { OrganizationMemberDto, OrganizationMembersListDto } from '../../dto/organizationMembers';
import { updateOrCreateOrganizationMember } from '../dao/organizationMemberDao';
import { logger } from '../../config/logger';

export const signupNewUser = async (dto: UserSignupDto): Promise<TokenResponseDto> => {
    logger.debug(`Signing up new user ${dto.username} via auth-service-api`);
    const tokens: TokenResponseDto = await AuthServiceClient.signup(dto);

    logger.debug(`Parsing received JWT token ${tokens.accessToken}`);
    const userSubject = parseJwtToken(tokens.accessToken);
    logger.debug(`Saving user with id=${userSubject.userId} into db`);
    await updateOrCreateUser({
        id: userSubject.userId,
        firstname: dto.firstName,
        lastname: dto.lastName,
        email: dto.username,
    });

    const organizations: OrganizationsListDto = await AuthServiceClient.getUserOrganizations(
        tokens.accessToken,
        {},
    );
    const orgEntry: OrganizationDto = organizations.entries[0];
    logger.debug(`Saving organization with id=${orgEntry.id} into db`);
    await updateOrCreateOrganization({
        id: orgEntry.id,
        creatorUserId: BigInt(userSubject.userId),
        name: orgEntry.name,
        slug: orgEntry.slug,
        siteUrl: orgEntry.url,
        description: orgEntry.description,
    });

    const members: OrganizationMembersListDto = await AuthServiceClient.getOrganizationMembers(
        tokens.accessToken,
        organizations.entries[0].slug,
        {},
    );
    const memberEntry: OrganizationMemberDto = members.entries[0];
    logger.debug(`Saving organization member with id=${memberEntry.id} into db`);
    await updateOrCreateOrganizationMember({
        id: memberEntry.id,
        memberUserId: BigInt(userSubject.userId),
        organizationId: BigInt(orgEntry.id),
        displayFirstname: null,
        displayLastname: null,
    });

    logger.debug(`Successfully signed up user ${userSubject.username}`);
    return tokens;
};
