import { Router } from 'express';
import { publicRouter } from './public';

const apiRouter = Router();

apiRouter.use('/public', publicRouter);

export { apiRouter };
