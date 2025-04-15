import { Router } from 'express';
import { logger } from '../../../../../config/logger';
import { UserLoginDto, UserSignupDto } from '../../../../../dto/users';
import { TokenResponseDto } from '../../../../../dto/common/TokenResponseDto';
import { loginViaAuthService, signupNewUser } from '../../../../../components/service/userService';
import { AbstractResponseDto } from '../../../../../dto/common/AbstractResponseDto';
import { AuthServiceClient } from '../../../../../components/api/AuthServiceClient';

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

publicUsersRouter.get('/exchange-short-code/:shortCode', async (req, res, next) => {
    try {
        const { shortCode } = req.params;
        logger.info(`Received GET /api/shrt/v0/public/users/exchange-short-code/${shortCode}`);
        const payload: TokenResponseDto = await AuthServiceClient.exchangeShortCode(shortCode);
        res.json({
            payloadType: 'TokenResponseDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

publicUsersRouter.get('/refresh-token', async (req, res, next) => {
    try {
        const refreshToken = req.headers.authorization;
        logger.info(`Received GET /api/shrt/v0/public/users/refresh-token`);
        const payload: TokenResponseDto = await AuthServiceClient.refreshToken(refreshToken);
        res.json({
            payloadType: 'TokenResponseDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

export { publicUsersRouter };
