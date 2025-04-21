import { Router, Request } from 'express';
import { permissionsGuard } from '../../../../../auth/permissionsGuard';
import { MemberPermission } from '../../../../../auth/common';
import { urlAccessGuard } from '../../../../../auth/urlAccessGuard';
import { findUrlByIdThrowable } from '../../../../../components/dao/shortUrls.dao';
import { config } from '../../../../../config';
import { ShortUrl } from '../../../../../db/model';
import { aggregateGlobalStatsForShortUrlCode } from '../../../../../components/service/statistics.service';
import { GlobalStatisticsDto } from '../../../../../dto/statistics.views';
import { parseJwtToken } from '../../../../../auth/jwt';
import { logger } from '../../../../../config/logger';

const statisticsRouter = Router({ mergeParams: true });

statisticsRouter.get(
    '/global',
    permissionsGuard(MemberPermission.MANAGE_URLS),
    urlAccessGuard,
    async (req: Request<{ slug: string; urlId: number }>, res, next) => {
        try {
            const { slug, urlId } = req.params;
            const { userId } = parseJwtToken(req.headers.authorization ?? '');
            logger.info(
                `Received /api/shrt/v0/user/organizations/${slug}/urls/${urlId}/stats/global by userId=${userId}`,
            );
            const url: ShortUrl = await findUrlByIdThrowable(urlId);
            const code: string = url.shortUrl.substring(config.urls.baseUrl.length + 1);
            const payload: GlobalStatisticsDto = await aggregateGlobalStatsForShortUrlCode(code);
            res.json({
                payloadType: 'GlobalStatisticsDto',
                payload,
            });
        } catch (e) {
            next(e);
        }
    },
);

export { statisticsRouter };
