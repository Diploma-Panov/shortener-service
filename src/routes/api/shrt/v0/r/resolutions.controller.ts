import { Request, Router } from 'express';
import { findUrlByShortCodeThrowable } from '../../../../../components/dao/shortUrls.dao';
import { logger } from '../../../../../config/logger';
import { errorHandlerMiddleware } from '../../../../../exception/errorHandling';

const resolutionsRouter = Router();

resolutionsRouter.get('/:code', async (req: Request<{ code: string }>, res, next) => {
    try {
        const { code } = req.params;
        const ip = req.ip;
        logger.info(`Received GET /r/${code} from ip=${ip}`);
        const { originalUrl } = await findUrlByShortCodeThrowable(code);
        res.redirect(originalUrl);
    } catch (e) {
        next(e);
    }
});

resolutionsRouter.use(errorHandlerMiddleware);

export { resolutionsRouter };
