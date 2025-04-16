import { Router } from 'express';
import { authenticatedUsersRouter } from './users';
import { dataSynchronizationMiddleware } from '../../../../../components/service/dataSynchronization';
import { authenticatedOrganizationsRouter } from './organizations';

const userRouter = Router();

userRouter.use(dataSynchronizationMiddleware);
userRouter.use('/users', authenticatedUsersRouter);
userRouter.use('/organizations', authenticatedOrganizationsRouter);

export { userRouter };
