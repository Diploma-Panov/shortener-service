import express, { Router } from 'express';
import { UserSignupDto } from '../../dto/users';
import {
    generateCompliantPassword,
    generateRandomAlphabeticalString,
    generateRandomUrl,
    generateUniqueEmail,
} from './dataUtils';
import { loginViaAuthService, signupNewUser } from '../../components/service/userService';
import { TokenResponseDto } from '../../dto/common/TokenResponseDto';
import { AuthServiceClient } from '../../components/api/AuthServiceClient';
import { config } from '../../config';
import { parseJwtToken } from '../../auth/jwt';

export const createTestApplication = (baseRouter: Router) => {
    const app = express();
    app.use(express.json());
    app.use('/', baseRouter);
    return app;
};

export const signupRandomUser = async (): Promise<{
    signupData: UserSignupDto;
    tokens: TokenResponseDto;
    userId: number;
}> => {
    const signupData: UserSignupDto = {
        username: generateUniqueEmail(),
        password: generateCompliantPassword(),
        firstName: generateRandomAlphabeticalString(20),
        lastName: generateRandomAlphabeticalString(20),
        companyName: generateRandomAlphabeticalString(30),
        registrationScope: 'SHORTENER_SCOPE',
        siteUrl: generateRandomUrl(),
        profilePictureBase64: null,
    };
    const tokens: TokenResponseDto = await signupNewUser(signupData);
    const userId: number = parseJwtToken(tokens.accessToken).userId;
    return {
        signupData,
        tokens,
        userId,
    };
};

export const signupRandomAdminUser = async (): Promise<{
    signupData: UserSignupDto;
    tokens: TokenResponseDto;
    userId: number;
}> => {
    const rv = await signupRandomUser();
    const { accessToken: adminAccessToken } = await AuthServiceClient.login({
        username: config.app.adminUsername,
        password: config.app.adminPassword,
    });
    await AuthServiceClient.updateUserSystemRoleByAdmin(rv.userId, adminAccessToken);
    rv.tokens = await loginViaAuthService({
        username: rv.signupData.username,
        password: rv.signupData.password,
    });
    return rv;
};
