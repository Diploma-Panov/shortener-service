import { Router } from 'express';
import { platformRouter } from './platform.controller';
import { publicUsersRouter } from './users.controller';
import { publicShortUrlsRouter } from './shortUrls.controller';

const publicRouter = Router();

publicRouter.use('/platform', platformRouter);
publicRouter.use('/users', publicUsersRouter);
publicRouter.use('/urls', publicShortUrlsRouter);

export { publicRouter };
