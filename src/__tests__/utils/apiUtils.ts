import express, { Router } from 'express';
import { UserSignupDto } from '../../dto/users';
import {
    generateCompliantPassword,
    generateRandomAlphabeticalString,
    generateRandomAlphanumericalString,
    generateRandomUrl,
    generateUniqueEmail,
    generateUniqueSlug,
} from './dataUtils';
import { loginViaAuthService, signupNewUser } from '../../components/service/userService';
import { TokenResponseDto } from '../../dto/common/TokenResponseDto';
import { AuthServiceClient } from '../../components/api/AuthServiceClient';
import { config } from '../../config';
import { parseJwtToken } from '../../auth/jwt';
import { CreateOrganizationDto, OrganizationDto } from '../../dto/organizations';
import { updateOrCreateOrganization } from '../../components/dao/organizationDao';

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

export const createOrganizationForUser = async (
    accessToken: string,
): Promise<{
    organization: OrganizationDto;
    tokens: TokenResponseDto;
}> => {
    const { userId } = parseJwtToken(accessToken);

    const slug: string = generateUniqueSlug();
    const dto: CreateOrganizationDto = {
        description: generateRandomAlphanumericalString(40),
        name: generateRandomAlphabeticalString(20),
        scope: 'SHORTENER_SCOPE',
        url: generateRandomUrl(),
        avatarBase64: null,
        slug,
    };

    const tokens: TokenResponseDto = await AuthServiceClient.createNewOrganization(
        accessToken,
        dto,
    );

    const organization: OrganizationDto = await AuthServiceClient.getUserOrganizationBySlug(
        tokens.accessToken,
        slug,
    );

    await updateOrCreateOrganization({
        id: organization.id,
        name: organization.name,
        creatorUserId: BigInt(userId),
        slug,
        siteUrl: organization.url,
        description: organization.description,
    });

    return {
        organization,
        tokens,
    };
};
