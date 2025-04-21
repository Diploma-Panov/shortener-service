import { Router } from 'express';
import { authenticatedUsersRouter } from './users.controller';
import { dataSynchronizationMiddleware } from '../../../../../middleware/dataSynchronization.middleware';
import { authenticatedOrganizationsRouter } from './organizations.controller';
import { authenticatedOrganizationMembersRouter } from './organizationMembers.controller';
import { authenticatedShortUrlsRouter } from './shortUrls.controller';
import { statisticsRouter } from './statistics.controller';

const userRouter = Router();

userRouter.use(dataSynchronizationMiddleware);
userRouter.use('/users', authenticatedUsersRouter);
userRouter.use('/organizations', authenticatedOrganizationsRouter);
userRouter.use(`/organizations/:slug/members`, authenticatedOrganizationMembersRouter);
userRouter.use(`/organizations/:slug/urls`, authenticatedShortUrlsRouter);
userRouter.use(`/organizations/:slug/urls/:urlId/stats`, statisticsRouter);

export { userRouter };
