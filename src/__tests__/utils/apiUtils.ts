import express, { Router } from 'express';
import { UserSignupDto } from '../../dto/users.views';
import {
    generateCompliantPassword,
    generateRandomAlphabeticalString,
    generateRandomAlphanumericalString,
    generateRandomUrl,
    generateUniqueEmail,
    generateUniqueSlug,
} from '../../utils/dataUtils';
import { loginViaAuthService, signupNewUser } from '../../components/service/users.service';
import { TokenResponseDto } from '../../dto/common/TokenResponseDto';
import { AuthServiceClient } from '../../components/api/AuthServiceClient';
import { config } from '../../config';
import { parseJwtToken } from '../../auth/jwt';
import {
    CreateOrganizationDto,
    OrganizationDto,
    OrganizationsListDto,
} from '../../dto/organizations.views';
import { updateOrCreateOrganization } from '../../components/dao/organization.dao';
import {
    InviteMemberDto,
    OrganizationMemberDto,
    OrganizationMembersListDto,
} from '../../dto/organizationMembers.views';
import { MemberRole, OrganizationAccessEntry } from '../../auth/common';
import { OrganizationScope } from '../../kafka/dto/userUpdates.views';
import { ShortUrl } from '../../db/model';
import { createNewShortUrlForOrganization } from '../../components/service/shortUrls.service';
import { CreateShortUrlDto } from '../../dto/shortUrls.views';

export const createTestApplication = (baseRouter: Router) => {
    const app = express();
    app.use(express.json());
    app.use('/', baseRouter);
    return app;
};

export const signupRandomUser = async (): Promise<{
    organization: OrganizationDto;
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

    const organizations: OrganizationsListDto = await AuthServiceClient.getUserOrganizations(
        tokens.accessToken,
        { scope: OrganizationScope.SHORTENER_SCOPE },
    );
    const organization: OrganizationDto = organizations.entries[0];

    return {
        organization,
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

export const inviteMemberInOrganization = async (
    slug: string,
    accessToken: string,
    partialModel?: Partial<InviteMemberDto>,
): Promise<{
    member: InviteMemberDto;
    user: { tokens: TokenResponseDto; signupData: UserSignupDto; userId: number };
    model: OrganizationMemberDto;
}> => {
    const user = await signupRandomUser();

    const member: InviteMemberDto = {
        allowedAllUrls: true,
        allowedUrls: [],
        email: user.signupData.username,
        firstname: generateRandomAlphabeticalString(20),
        lastname: generateRandomAlphabeticalString(20),
        roles: [MemberRole.ORGANIZATION_MEMBER],
        ...partialModel,
    };

    await AuthServiceClient.inviteNewOrganizationMember(accessToken, slug, member);

    const members: OrganizationMembersListDto = await AuthServiceClient.getOrganizationMembers(
        accessToken,
        slug,
        { q: 10000 },
    );
    const model: OrganizationMemberDto = members.entries.find(
        (m) => m.email === user.signupData.username,
    )!;

    user.tokens = await AuthServiceClient.refreshToken(user.tokens.refreshToken ?? '');

    return {
        member,
        user,
        model,
    };
};

export const createShortUrlForOrganization = async (
    slug: string,
    accessToken: string,
    tags?: string[],
): Promise<{ url: ShortUrl; tokens: TokenResponseDto }> => {
    const { userId, organizations } = parseJwtToken(accessToken);
    const o: OrganizationAccessEntry = organizations.find((o) => o.slug === slug)!;
    const dto: CreateShortUrlDto = {
        originalUrl: generateRandomUrl(),
        tags: tags ? tags : ['test'],
    };
    return await createNewShortUrlForOrganization(slug, userId, dto, {
        allowedUrls: o.allowedUrls,
        allowedAllUrls: o.allowedAllUrls,
    });
};
