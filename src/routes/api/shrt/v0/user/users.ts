import { Router } from 'express';
import { logger } from '../../../../../config/logger';
import {
    UpdateUserInfoDto,
    UpdateUserProfilePictureDto,
    UserInfoDto,
} from '../../../../../dto/users';
import { AuthServiceClient } from '../../../../../components/api/AuthServiceClient';
import { updateOrCreateUser } from '../../../../../components/dao/userDao';
import { parseJwtToken } from '../../../../../auth/jwt';

const authenticatedUsersRouter = Router();

authenticatedUsersRouter.get('/info', async (req, res, next) => {
    try {
        logger.info(`Received GET /api/shrt/v0/user/users/info`);
        const token: string = req.headers.authorization ?? '';
        const payload: UserInfoDto = await AuthServiceClient.getPersonalInfo(token);
        res.json({
            payloadType: 'UserInfoDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

authenticatedUsersRouter.patch('/info', async (req, res, next) => {
    try {
        const dto: UpdateUserInfoDto = req.body;
        logger.info(`Received PATCH /api/shrt/v0/user/users/info, with dto=${JSON.stringify(dto)}`);
        const accessToken = req.headers.authorization ?? '';
        const payload: UserInfoDto = await AuthServiceClient.updateUserInfo(accessToken, dto);
        await updateOrCreateUser(payload);
        res.json({
            payloadType: 'UserInfoDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

authenticatedUsersRouter.put('/picture', async (req, res, next) => {
    try {
        const dto: UpdateUserProfilePictureDto = req.body;
        const accessToken: string = req.headers.authorization ?? '';
        const { userId } = parseJwtToken(accessToken);
        logger.info(`Received PUT /api/shrt/v0/user/users/picture for userId=${userId}`);
        const payload: UserInfoDto = await AuthServiceClient.updateProfilePicture(accessToken, dto);
        res.json({
            payloadType: 'UserInfoDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

export { authenticatedUsersRouter };
