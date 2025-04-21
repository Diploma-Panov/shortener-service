import { logger } from '../config/logger';
import { parseJwtToken } from '../auth/jwt';
import { updateOrCreateUser } from '../components/dao/user.dao';
import { OrganizationDto, OrganizationsListDto } from '../dto/organizations.views';
import { AuthServiceClient } from '../components/api/AuthServiceClient';
import { MemberRole, OrganizationAccessEntry } from '../auth/common';
import { updateOrCreateOrganization } from '../components/dao/organization.dao';
import { OrganizationMembersListDto } from '../dto/organizationMembers.views';
import { updateOrCreateOrganizationMember } from '../components/dao/organizationMember.dao';
import { NextFunction, Request, Response } from 'express';
import { OrganizationScope } from '../kafka/dto/userUpdates.views';

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

    const members: OrganizationMembersListDto =
        await AuthServiceClient.getAllMembersOfUserByIdBySystem(userSubject.userId);

    const promises: Promise<void>[] = [];
    for (const memberEntry of members.entries) {
        const promise = (async () => {
            try {
                logger.debug(`Saving organization member with id=${memberEntry.id} into db [SAFE]`);
                const nameParts: string[] = memberEntry.fullName
                    ? memberEntry.fullName.split(' ')
                    : [userSubject.firstname];
                if (nameParts.length === 1 && userSubject.lastname) {
                    nameParts.push(userSubject.lastname);
                }
                await updateOrCreateOrganizationMember({
                    id: memberEntry.id,
                    memberUserId: BigInt(userSubject.userId),
                    organizationId: BigInt(memberEntry.organizationId),
                    displayFirstname: nameParts[0],
                    displayLastname: nameParts.length > 1 ? nameParts[1] : null,
                });
            } catch (e) {
                logger.warn(e);
            }
        })();

        promises.push(promise);
    }

    await Promise.all(promises);
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
