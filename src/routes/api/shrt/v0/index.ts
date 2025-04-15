import { Router } from 'express';
import { publicRouter } from './public';
import { errorHandlerMiddleware } from '../../../../exception/errorHandling';

const apiRouter = Router();

apiRouter.use('/public', publicRouter);
apiRouter.use(errorHandlerMiddleware);

export { apiRouter };
