import { TokenResponseDto } from '../../dto/common/TokenResponseDto';
import { UserLoginDto, UserSignupDto } from '../../dto/users';
import { AuthServiceClient } from '../api/AuthServiceClient';
import { updateOrCreateUser } from '../dao/userDao';
import { parseJwtToken } from '../../auth/jwt';
import { OrganizationDto, OrganizationsListDto } from '../../dto/organizations';
import { updateOrCreateOrganization } from '../dao/organizationDao';
import { OrganizationMemberDto, OrganizationMembersListDto } from '../../dto/organizationMembers';
import { updateOrCreateOrganizationMember } from '../dao/organizationMemberDao';
import { logger } from '../../config/logger';
import { MemberRole, OrganizationAccessEntry } from '../../auth/common';

const ensureInfoIsSynchronized = async (accessToken: string): Promise<void> => {
    logger.debug(`Parsing received JWT token ${accessToken}`);
    const userSubject = parseJwtToken(accessToken);
    logger.debug(`Saving user with id=${userSubject.userId} into db`);
    await updateOrCreateUser({
        id: userSubject.userId,
        firstname: userSubject.firstname,
        lastname: userSubject.lastname,
        email: userSubject.username,
    });

    const organizations: OrganizationsListDto = await AuthServiceClient.getUserOrganizations(
        accessToken,
        { p: 0, q: 1000 },
    );
    const personalEntry: OrganizationAccessEntry = userSubject.organizations.find((o) =>
        o.roles.includes(MemberRole.ORGANIZATION_OWNER),
    )!;
    const orgEntry: OrganizationDto = organizations.entries.find(
        (e) => e.id === personalEntry.organizationId,
    )!;
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
        accessToken,
        orgEntry.slug,
        { p: 0, q: 1000 },
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
};

export const signupNewUser = async (dto: UserSignupDto): Promise<TokenResponseDto> => {
    logger.debug(`Signing up new user ${dto.username} via auth-service-api`);
    const tokens: TokenResponseDto = await AuthServiceClient.signup(dto);
    await ensureInfoIsSynchronized(tokens.accessToken);
    logger.debug(`Successfully signed up user ${dto.username}`);
    return tokens;
};

export const loginViaAuthService = async (dto: UserLoginDto): Promise<TokenResponseDto> => {
    logger.info(`Trying to login user ${dto.username}`);
    const tokens: TokenResponseDto = await AuthServiceClient.login(dto);
    await ensureInfoIsSynchronized(tokens.accessToken);
    return tokens;
};
