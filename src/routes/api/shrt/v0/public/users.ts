import { Router } from 'express';
import { logger } from '../../../../../config/logger';
import { UserLoginDto, UserSignupDto } from '../../../../../dto/users';
import { TokenResponseDto } from '../../../../../dto/common/TokenResponseDto';
import { loginViaAuthService, signupNewUser } from '../../../../../components/service/userService';
import { AbstractResponseDto } from '../../../../../dto/common/AbstractResponseDto';

const publicUsersRouter = Router();

publicUsersRouter.post('/signup', async (req, res, next) => {
    try {
        const dto: UserSignupDto = req.body;
        logger.info(
            `Received POST /api/shrt/v0/public/users/signup, with dto=${JSON.stringify(dto)}`,
        );
        const payload: TokenResponseDto = await signupNewUser(dto);
        res.json({
            payloadType: 'TokenResponseDto',
            payload,
        } as AbstractResponseDto<TokenResponseDto>);
    } catch (e) {
        next(e);
    }
});

publicUsersRouter.post('/login', async (req, res, next) => {
    try {
        const dto: UserLoginDto = req.body;
        logger.info(
            `Received POST /api/shrt/v0/public/users/login, with dto=${JSON.stringify(dto)}`,
        );
        const payload: TokenResponseDto = await loginViaAuthService(dto);
        res.json({
            payloadType: 'TokenResponseDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

export { publicUsersRouter };
