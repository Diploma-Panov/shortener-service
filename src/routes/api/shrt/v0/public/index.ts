import { Router } from 'express';
import { platformRouter } from './platform';
import { publicUsersRouter } from './users';

const publicRouter = Router();

publicRouter.use('/platform', platformRouter);
publicRouter.use('/users', publicUsersRouter);

export { publicRouter };
