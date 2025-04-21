import { NextFunction, Request, Response, Router } from 'express';
import { findUrlByShortCodeThrowable } from '../../../../../components/dao/shortUrls.dao';
import { logger } from '../../../../../config/logger';
import { errorHandlerMiddleware } from '../../../../../exception/errorHandling';
import { ShortUrlState } from '../../../../../db/model';
import { NotFoundError } from '../../../../../exception/NotFoundError';
import { redisClient } from '../../../../../config/redis';
import { recordResolution } from '../../../../../components/service/resolutions.service';

const resolutionsRouter = Router();

resolutionsRouter.get(
    '/:code',
    async (req: Request<{ code: string }>, res: Response, next: NextFunction) => {
        const { code } = req.params;
        const ip =
            req.ip === '::ffff:127.0.0.1' || req.ip === '::1'
                ? (req.headers['x-forwarded-for'] as string)
                : req.ip;
        logger.info(`Received GET /r/${code} from ip=${ip}`);

        try {
            // 0) Asynchronously save resolution in DynamoDB
            void recordResolution(code, ip || '').catch((err) =>
                logger.warn('recordResolution failed', err),
            );

            // 1) Try cache
            const cached = await redisClient.get(code);
            if (cached) {
                logger.debug(`Cache hit for code=${code}, returning ${cached}`);
                res.redirect(cached);
                return;
            }

            // 2) Fallback to DB
            const { originalUrl, shortUrlState } = await findUrlByShortCodeThrowable(code);

            if (shortUrlState !== ShortUrlState.ACTIVE) {
                next(new NotFoundError('ShortUrl', 'code', code));
                return;
            }

            // 3) Cache it for 60s, then redirect
            await redisClient.set(code, originalUrl, { EX: 60 });
            logger.debug(`Cached /r/${code} → ${originalUrl} for 60s`);

            res.redirect(originalUrl);
        } catch (e) {
            next(e);
        }
    },
);

resolutionsRouter.use(errorHandlerMiddleware);

export { resolutionsRouter };
