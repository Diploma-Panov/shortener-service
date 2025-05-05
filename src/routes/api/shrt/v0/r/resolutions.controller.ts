import { NextFunction, Request, Response, Router } from 'express';
import { findUrlByShortCodeThrowable } from '../../../../../components/dao/shortUrls.dao';
import { logger } from '../../../../../config/logger';
import { errorHandlerMiddleware } from '../../../../../exception/errorHandling';
import { ShortUrlState } from '../../../../../db/model';
import { NotFoundError } from '../../../../../exception/NotFoundError';
import { redisClient } from '../../../../../config/redis';
import { recordResolution } from '../../../../../components/service/resolutions.service';

export function isPrivateIp(ip: string): boolean {
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }
    if (ip === '::1') {
        ip = '127.0.0.1';
    }

    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) {
        return false;
    }

    const [a, b] = parts;

    if (a === 10) {
        return true;
    }
    if (a === 172 && b >= 16 && b <= 31) {
        return true;
    }
    if (a === 192 && b === 168) {
        return true;
    }
    if (a === 127) {
        return true;
    }

    return false;
}

const resolutionsRouter = Router();

resolutionsRouter.get(
    '/:code',
    async (req: Request<{ code: string }>, res: Response, next: NextFunction) => {
        const { code } = req.params;
        const ip =
            req.ip && isPrivateIp(req.ip) ? (req.headers['x-forwarded-for'] as string) : req.ip;
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
