import { Request, Router } from 'express';
import {
    CreateShortUrlDto,
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
            const payload: TokenResponseDto = await createNewShortUrlForOrganization(
                slug,
                userId,
                dto,
                {
                    allowedUrls: orgAccess.allowedUrls,
                    allowedAllUrls: orgAccess.allowedAllUrls,
                },
            );
            res.json({
                payloadType: 'TokenResponseDto',
                payload,
            });
        } catch (e) {
            next(e);
        }
    },
);

export { authenticatedShortUrlsRouter };
