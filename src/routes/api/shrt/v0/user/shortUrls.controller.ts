import { Router, Request } from 'express';
import { ShortUrlsListDto, ShortUrlsSearchParams } from '../../../../../dto/shortUrls.views';

const authenticatedShortUrlsRouter = Router({ mergeParams: true });

authenticatedShortUrlsRouter.get(
    '/',
    async (
        req: Request<{ slug: string }, ShortUrlsListDto, void, ShortUrlsSearchParams>,
        res,
        next,
    ) => {
        try {
        } catch (e) {
            next(e);
        }
    },
);

export { authenticatedShortUrlsRouter };
