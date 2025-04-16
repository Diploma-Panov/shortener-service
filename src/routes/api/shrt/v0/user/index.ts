import { Router } from 'express';
import { authenticatedUsersRouter } from './users';
import { dataSynchronizationMiddleware } from '../../../../../components/service/dataSynchronization';

const userRouter = Router();

userRouter.use(dataSynchronizationMiddleware);
userRouter.use('/users', authenticatedUsersRouter);

export { userRouter };
