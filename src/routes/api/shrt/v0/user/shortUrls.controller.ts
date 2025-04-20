import { Router, Request } from 'express';
import { ShortUrlsListDto, ShortUrlsSearchParams } from '../../../../../dto/shortUrls.views';
import { getShortUrlsListBySlug } from '../../../../../components/service/shortUrls.service';
import { AbstractResponseDto } from '../../../../../dto/common/AbstractResponseDto';
import { parseJwtToken } from '../../../../../auth/jwt';
import { permissionsGuard } from '../../../../../auth/permissionsGuard';
import { MemberPermission } from '../../../../../auth/common';
import { logger } from '../../../../../config/logger';

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
            const { userId } = parseJwtToken(req.headers.authorization ?? '');
            logger.info(
                `Received GET /api/shrt/v0/user/organizations/${slug}/urls by userId=${userId} with query=${JSON.stringify(
                    query,
                )}`,
            );
            const payload: ShortUrlsListDto = await getShortUrlsListBySlug(slug, query);
            res.json({
                payloadType: 'ShortUrlsListDto',
                payload,
            });
        } catch (e) {
            next(e);
        }
    },
);

export { authenticatedShortUrlsRouter };
