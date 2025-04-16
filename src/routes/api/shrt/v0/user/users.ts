import { Router } from 'express';
import { logger } from '../../../../../config/logger';
import { UserInfoDto } from '../../../../../dto/users';
import { AuthServiceClient } from '../../../../../components/api/AuthServiceClient';

const authenticatedUsersRouter = Router();

authenticatedUsersRouter.get('/info', async (req, res) => {
    logger.info(`Received GET /api/shrt/v0/user/users/info`);
    const token: string = req.headers.authorization ?? '';
    const payload: UserInfoDto = await AuthServiceClient.getPersonalInfo(token);
    res.json({
        payloadType: 'UserInfoDto',
        payload,
    });
});

export { authenticatedUsersRouter };
