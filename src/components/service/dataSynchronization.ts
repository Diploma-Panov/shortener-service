import { logger } from '../../config/logger';
import { parseJwtToken } from '../../auth/jwt';
import { updateOrCreateUser } from '../dao/userDao';
import { OrganizationDto, OrganizationsListDto } from '../../dto/organizations';
import { AuthServiceClient } from '../api/AuthServiceClient';
import { MemberRole, OrganizationAccessEntry } from '../../auth/common';
import { updateOrCreateOrganization } from '../dao/organizationDao';
import { OrganizationMemberDto, OrganizationMembersListDto } from '../../dto/organizationMembers';
import { updateOrCreateOrganizationMember } from '../dao/organizationMemberDao';
import { NextFunction, Request, Response } from 'express';
import { OrganizationScope } from '../../kafka/dto/userUpdates';

export const ensureInfoIsSynchronized = async (accessToken: string): Promise<void> => {
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
        { p: 0, q: 1000, scope: OrganizationScope.SHORTENER_SCOPE },
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

export const dataSynchronizationMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        const accessToken: string | null | undefined = req.headers.authorization;
        if (!!accessToken) {
            await ensureInfoIsSynchronized(accessToken);
        }
    } catch (e) {
        logger.error(`Could not synchronize data. Root cause - ${e}`);
    }
    next();
};
