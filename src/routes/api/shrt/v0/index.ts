import { Router } from 'express';
import { publicRouter } from './public';
import { userRouter } from './user';
import { errorHandlerMiddleware } from '../../../../exception/errorHandling';

const apiRouter = Router();

apiRouter.use('/public', publicRouter);
apiRouter.use('/user', userRouter);
apiRouter.use(errorHandlerMiddleware);

export { apiRouter };
