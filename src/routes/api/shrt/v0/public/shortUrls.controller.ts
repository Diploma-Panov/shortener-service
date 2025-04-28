import { Router, Request } from 'express';
import { AbstractResponseDto } from '../../../../../dto/common/AbstractResponseDto';
import { ShortUrlDto } from '../../../../../dto/shortUrls.views';
import { logger } from '../../../../../config/logger';
import { createTrialShortUrl } from '../../../../../components/service/shortUrls.service';

const publicShortUrlsRouter = Router();

publicShortUrlsRouter.post(
    '/',
    async (
        req: Request<unknown, AbstractResponseDto<ShortUrlDto>, { originalUrl: string }>,
        res,
        next,
    ) => {
        const { originalUrl } = req.body;
        logger.info(`Received POST /api/shrt/v0/public/urls for originalUrl=${originalUrl}`);
        try {
            const payload: ShortUrlDto = await createTrialShortUrl(originalUrl);
            res.json({
                payloadType: 'ShortUrlDto',
                payload,
            });
        } catch (e) {
            next(e);
        }
    },
);

export { publicShortUrlsRouter };
