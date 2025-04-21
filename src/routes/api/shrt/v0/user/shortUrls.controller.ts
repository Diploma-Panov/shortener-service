import { NextFunction, Request, Response, Router } from 'express';
import {
    ChangeUrlStateDto,
    CreateShortUrlDto,
    ShortUrlDto,
    ShortUrlsListDto,
    ShortUrlsSearchParams,
} from '../../../../../dto/shortUrls.views';
import {
    createNewShortUrlForOrganization,
    getShortUrlsListBySlug,
} from '../../../../../components/service/shortUrls.service';
import { AbstractResponseDto } from '../../../../../dto/common/AbstractResponseDto';
import { parseJwtToken } from '../../../../../auth/jwt';
import { permissionsGuard } from '../../../../../auth/permissionsGuard';
import { MemberPermission, OrganizationAccessEntry } from '../../../../../auth/common';
import { logger } from '../../../../../config/logger';
import { TokenResponseDto } from '../../../../../dto/common/TokenResponseDto';
import { validationMiddleware } from '../../../../../middleware/validation.middleware';
import {
    findUrlByIdThrowable,
    updateUrlWithNewStateById,
} from '../../../../../components/dao/shortUrls.dao';
import {
    OrganizationMember,
    ShortUrl,
    ShortUrlState,
    ShortUrlType,
    User,
} from '../../../../../db/model';
import { findMemberByIdThrowable } from '../../../../../components/dao/organizationMember.dao';
import { findUserByIdThrowable } from '../../../../../components/dao/user.dao';
import { urlAccessGuard } from '../../../../../auth/urlAccessGuard';

const authenticatedShortUrlsRouter = Router({ mergeParams: true });

authenticatedShortUrlsRouter.get(
    '/',
    permissionsGuard(MemberPermission.BASIC_VIEW),
    async (
        req: Request<
            { slug: string },
            AbstractResponseDto<ShortUrlsListDto>,
            void,
            ShortUrlsSearchParams
        >,
        res,
        next,
    ) => {
        try {
            const { slug } = req.params;

            const query: ShortUrlsSearchParams = req.query;
            const rawTags = (query as any).tags;
            query.tags =
                typeof rawTags === 'string' ? [rawTags] : Array.isArray(rawTags) ? rawTags : [];
            query.p = query.p ? Number(query.p) : undefined;
            query.q = query.q ? Number(query.q) : undefined;

            const { userId, organizations } = parseJwtToken(req.headers.authorization ?? '');
            const { allowedAllUrls, allowedUrls } = organizations.find((o) => o.slug === slug)!;
            logger.info(
                `Received GET /api/shrt/v0/user/organizations/${slug}/urls by userId=${userId} with query=${JSON.stringify(
                    query,
                )}`,
            );
            const payload: ShortUrlsListDto = await getShortUrlsListBySlug(
                slug,
                query,
                allowedUrls,
                allowedAllUrls,
            );
            res.json({
                payloadType: 'ShortUrlsListDto',
                payload,
            });
        } catch (e) {
            next(e);
        }
    },
);

authenticatedShortUrlsRouter.get(
    '/:urlId',
    permissionsGuard(MemberPermission.BASIC_VIEW),
    urlAccessGuard,
    async (
        req: Request<{ slug: string; urlId: number }, AbstractResponseDto<ShortUrlDto>>,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { slug, urlId } = req.params;
            const { userId } = parseJwtToken(req.headers.authorization ?? '');
            logger.info(
                `Received GET /api/shrt/v0/user/organizations/${slug}/urls/${urlId} by userId=${userId}`,
            );
            const url: ShortUrl = await findUrlByIdThrowable(urlId);
            const member: OrganizationMember = await findMemberByIdThrowable(
                Number(url.creatorMemberId),
            );
            const user: User = await findUserByIdThrowable(Number(member.memberUserId));
            const creatorName: string = member.displayFirstname
                ? member.displayFirstname +
                  (member.displayLastname ? ' ' + member.displayLastname : '')
                : user.firstname + (user.lastname ? ' ' + user.lastname : '');
            const payload: ShortUrlDto = {
                id: url.id,
                creatorName,
                originalUrl: url.originalUrl,
                shortUrl: url.shortUrl,
                state: url.shortUrlState as ShortUrlState,
                type: url.shortUrlType as ShortUrlType,
                tags: url.tags,
            };
            res.json({
                payloadType: 'ShortUrlDto',
                payload,
            });
        } catch (e) {
            next(e);
        }
    },
);

authenticatedShortUrlsRouter.post(
    '/',
    permissionsGuard(MemberPermission.MANAGE_URLS),
    validationMiddleware(CreateShortUrlDto),
    async (
        req: Request<{ slug: string }, AbstractResponseDto<TokenResponseDto>, CreateShortUrlDto>,
        res,
        next,
    ) => {
        try {
            const { slug } = req.params;
            const { userId, organizations } = parseJwtToken(req.headers.authorization ?? '');
            const orgAccess: OrganizationAccessEntry = organizations.find((o) => o.slug === slug)!;
            const dto: CreateShortUrlDto = req.body;
            logger.info(
                `Received POST /api/shrt/v0/user/organizations/${slug}/urls by userId=${userId} with dto=${JSON.stringify(
                    dto,
                )}`,
            );
            const { tokens: payload } = await createNewShortUrlForOrganization(slug, userId, dto, {
                allowedUrls: orgAccess.allowedUrls,
                allowedAllUrls: orgAccess.allowedAllUrls,
            });
            res.json({
                payloadType: 'TokenResponseDto',
                payload,
            });
        } catch (e) {
            next(e);
        }
    },
);

authenticatedShortUrlsRouter.put(
    '/:urlId',
    urlAccessGuard,
    permissionsGuard(MemberPermission.MANAGE_URLS),
    async (
        req: Request<
            { slug: string; urlId: number },
            AbstractResponseDto<ShortUrlDto>,
            ChangeUrlStateDto
        >,
        res,
        next,
    ) => {
        try {
            const { slug, urlId } = req.params;
            const { userId } = parseJwtToken(req.headers.authorization ?? '');
            const dto: ChangeUrlStateDto = req.body;
            logger.info(
                `Received PUT /api/shrt/v0/user/organizations/${slug}/urls/${urlId} by userId=${userId} with dto=${JSON.stringify(
                    dto,
                )}`,
            );
            const url = (await updateUrlWithNewStateById(urlId, dto.newState))!;
            const member: OrganizationMember = await findMemberByIdThrowable(
                Number(url.creatorMemberId),
            );
            const user: User = await findUserByIdThrowable(Number(member.memberUserId));
            const creatorName: string = member.displayFirstname
                ? member.displayFirstname +
                  (member.displayLastname ? ' ' + member.displayLastname : '')
                : user.firstname + (user.lastname ? ' ' + user.lastname : '');
            const payload: ShortUrlDto = {
                id: url.id,
                creatorName,
                originalUrl: url.originalUrl,
                shortUrl: url.shortUrl,
                state: url.shortUrlState as ShortUrlState,
                type: url.shortUrlType as ShortUrlType,
                tags: url.tags,
            };
            res.json({
                payloadType: 'ShortUrlDto',
                payload,
            });
        } catch (e) {
            next(e);
        }
    },
);

export { authenticatedShortUrlsRouter };
