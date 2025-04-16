import { Router } from 'express';
import { publicRouter } from './public';
import { errorHandlerMiddleware } from '../../../../exception/errorHandling';
import { userRouter } from './user';

const apiRouter = Router();

apiRouter.use('/public', publicRouter);
apiRouter.use('/user', userRouter);

apiRouter.use(errorHandlerMiddleware);

export { apiRouter };
