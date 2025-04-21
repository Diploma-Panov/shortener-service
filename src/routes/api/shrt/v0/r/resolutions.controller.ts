import { Request, Router } from 'express';
import { findUrlByShortCodeThrowable } from '../../../../../components/dao/shortUrls.dao';
import { logger } from '../../../../../config/logger';
import { errorHandlerMiddleware } from '../../../../../exception/errorHandling';
import { ShortUrlState } from '../../../../../db/model';
import { NotFoundError } from '../../../../../exception/NotFoundError';

const resolutionsRouter = Router();

resolutionsRouter.get('/:code', async (req: Request<{ code: string }>, res, next) => {
    try {
        const { code } = req.params;
        const ip = req.ip;
        logger.info(`Received GET /r/${code} from ip=${ip}`);
        const { originalUrl, shortUrlState } = await findUrlByShortCodeThrowable(code);
        if (shortUrlState === ShortUrlState.ACTIVE) {
            res.redirect(originalUrl);
        } else {
            next(new NotFoundError('ShortUrl', 'code', code));
        }
    } catch (e) {
        next(e);
    }
});

resolutionsRouter.use(errorHandlerMiddleware);

export { resolutionsRouter };
