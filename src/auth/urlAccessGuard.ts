import { NextFunction, Request, Response } from 'express';
import { parseJwtToken } from './jwt';
import { OrganizationAccessEntry } from './common';
import { AuthError } from '../exception/AuthError';
import { ServiceErrorType } from '../exception/errorHandling';

export const urlAccessGuard = (
    req: Request<{ slug: string; urlId: number }>,
    _res: Response,
    next: NextFunction,
) => {
    const { slug, urlId } = req.params;
    const { userId, organizations } = parseJwtToken(req.headers.authorization ?? '');
    const o: OrganizationAccessEntry = organizations.find((o) => o.slug === slug)!;

    if (o.allowedAllUrls || o.allowedUrls.includes(Number(urlId))) {
        next();
        return;
    }

    throw new AuthError(
        `User ${userId} does not have access to url ${urlId} in organization ${slug}`,
        ServiceErrorType.ACCESS_DENIED,
    );
};
