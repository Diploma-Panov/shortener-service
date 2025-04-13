import { Router } from 'express';
import { logger } from '../../../../../config/logger';
import { UserSignupDto } from '../../../../../dto/users';
import { TokenResponseDto } from '../../../../../dto/common/TokenResponseDto';
import { signupNewUser } from '../../../../../components/service/userService';
import { AbstractResponseDto } from '../../../../../dto/common/AbstractResponseDto';

const publicUsersRouter = Router();

publicUsersRouter.post('/signup', async (req, res, next) => {
    try {
        const dto: UserSignupDto = req.body;
        logger.info(`Received POST /api/shrt/v0/public/users/signup, with dto=${dto}`);
        const payload: TokenResponseDto = await signupNewUser(dto);
        res.json({
            payloadType: 'TokenResponseDto',
            payload,
        } as AbstractResponseDto<TokenResponseDto>);
    } catch (e) {
        next(e);
    }
});

export { publicUsersRouter };
