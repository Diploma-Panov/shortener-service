import { NextFunction, Request, Response } from 'express';
import { AuthError } from '../exception/AuthError';
import { ServiceErrorType } from '../exception/errorHandling';
import { hasPermission, MemberPermission, MemberRole, OrganizationAccessEntry } from './common';
import { parseJwtToken } from './jwt';

export const permissionsGuard =
    (permission: MemberPermission) =>
    async (req: Request<{ slug: string }>, _res: Response, next: NextFunction) => {
        try {
            const { slug } = req.params;
            const { userId, organizations } = parseJwtToken(req.headers.authorization ?? '');
            const targetOrganization: OrganizationAccessEntry | undefined = organizations.find(
                (o) => o.slug === slug,
            );
            if (!targetOrganization) {
                next(
                    new AuthError(
                        `User ${userId} does not have access to organization ${slug}`,
                        ServiceErrorType.ACCESS_DENIED,
                    ),
                );
                return;
            }
            const roles: MemberRole[] = targetOrganization.roles;

            if (!hasPermission(roles, permission)) {
                next(
                    new AuthError(
                        `User ${userId} does not have permissions to perform this action in organization ${slug}`,
                        ServiceErrorType.ORGANIZATION_ACTION_NOT_ALLOWED,
                    ),
                );
            }
        } catch (e) {
            next(new AuthError(JSON.stringify(e), ServiceErrorType.ACCESS_DENIED));
        }
    };
