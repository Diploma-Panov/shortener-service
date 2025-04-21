import { NextFunction, Request, Response, Router } from 'express';
import { permissionsGuard } from '../../../../../auth/permissionsGuard';
import { MemberPermission } from '../../../../../auth/common';
import { urlAccessGuard } from '../../../../../auth/urlAccessGuard';
import { findUrlByIdThrowable } from '../../../../../components/dao/shortUrls.dao';
import { config } from '../../../../../config';
import { ShortUrl } from '../../../../../db/model';
import {
    aggregateGlobalStatsForShortUrlCode,
    aggregatePeriodStatsByCode,
} from '../../../../../components/service/statistics.service';
import { GlobalStatisticsDto, PeriodCountsDto } from '../../../../../dto/statistics.views';
import { parseJwtToken } from '../../../../../auth/jwt';
import { logger } from '../../../../../config/logger';
import { BadRequestError } from '../../../../../exception/BadRequestError';
import { AbstractResponseDto } from '../../../../../dto/common/AbstractResponseDto';

const statisticsRouter = Router({ mergeParams: true });

const intervalValidationPipe = async (
    req: Request<unknown>,
    _res: Response,
    next: NextFunction,
): Promise<void> => {
    const { start, end, period } = req.query as Record<string, string>;

    if (!start || !end || !period) {
        next(new BadRequestError('Please provide `start`, `end`, and `period` query params'));
        return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const periodSec = Number(period);
    if (isNaN(periodSec) || periodSec <= 0) {
        next(new BadRequestError('`period` must be a positive number of seconds'));
        return;
    }
    if (startDate >= endDate) {
        next(new BadRequestError('`start` must be before `end`'));
        return;
    }
    next();
};

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

statisticsRouter.get(
    '/time-range',
    permissionsGuard(MemberPermission.MANAGE_URLS),
    urlAccessGuard,
    intervalValidationPipe,
    async (
        req: Request<{ slug: string; urlId: number }, AbstractResponseDto<PeriodCountsDto>>,
        res: Response,
        next: NextFunction,
    ) => {
        const { urlId } = req.params;
        const { start, end, period } = req.query as Record<string, string>;

        const startDate = new Date(start);
        const endDate = new Date(end);
        const periodSec = Number(period);

        let prefix: string;
        let sliceLen: number;
        if (periodSec < 3600) {
            prefix = 'MINUTE#';
            sliceLen = 16;
        } else if (periodSec < 86400) {
            prefix = 'HOUR#';
            sliceLen = 13;
        } else if (periodSec < 2592000) {
            prefix = 'DATE#';
            sliceLen = 10;
        } else {
            prefix = 'MONTH#';
            sliceLen = 7;
        }

        const startKey = prefix + startDate.toISOString().slice(0, sliceLen);
        const endKey = prefix + endDate.toISOString().slice(0, sliceLen);

        try {
            const { shortUrl } = await findUrlByIdThrowable(urlId);
            const code: string = shortUrl.substring(config.urls.baseUrl.length + 1);

            const payload: PeriodCountsDto = await aggregatePeriodStatsByCode({
                code,
                endDate,
                endKey,
                periodSec,
                prefix,
                sliceLen,
                startDate,
                startKey,
            });
            res.json({
                payloadType: 'PeriodCountsDto',
                payload,
            });
        } catch (err) {
            next(err);
        }
    },
);

export { statisticsRouter };
