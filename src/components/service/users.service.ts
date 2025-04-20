import { TokenResponseDto } from '../../dto/common/TokenResponseDto';
import { UserLoginDto, UserSignupDto } from '../../dto/users.views';
import { AuthServiceClient } from '../api/AuthServiceClient';
import { logger } from '../../config/logger';
import { ensureInfoIsSynchronized } from './dataSynchronization.service';

export const signupNewUser = async (dto: UserSignupDto): Promise<TokenResponseDto> => {
    logger.debug(`Signing up new user ${dto.username} via auth-service-api`);
    const tokens: TokenResponseDto = await AuthServiceClient.signup(dto);
    await ensureInfoIsSynchronized(tokens.accessToken);
    logger.debug(`Successfully signed up user ${dto.username}`);
    return tokens;
};

export const loginViaAuthService = async (dto: UserLoginDto): Promise<TokenResponseDto> => {
    logger.info(`Trying to login user ${dto.username}`);
    const tokens: TokenResponseDto = await AuthServiceClient.login(dto);
    await ensureInfoIsSynchronized(tokens.accessToken);
    return tokens;
};
