import { Router } from 'express';
import { authenticatedUsersRouter } from './users';
import { dataSynchronizationMiddleware } from '../../../../../components/service/dataSynchronization';
import { authenticatedOrganizationsRouter } from './organizations';
import { authenticatedOrganizationMembersRouter } from './organizationMembers';

const userRouter = Router();

userRouter.use(dataSynchronizationMiddleware);
userRouter.use('/users', authenticatedUsersRouter);
userRouter.use('/organizations', authenticatedOrganizationsRouter);
userRouter.use(`/organizations/:slug/members`, authenticatedOrganizationMembersRouter);

export { userRouter };
