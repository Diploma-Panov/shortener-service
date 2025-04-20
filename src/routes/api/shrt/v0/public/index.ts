import { Router } from 'express';
import { platformRouter } from './platform.controller';
import { publicUsersRouter } from './users.controller';

const publicRouter = Router();

publicRouter.use('/platform', platformRouter);
publicRouter.use('/users', publicUsersRouter);

export { publicRouter };
