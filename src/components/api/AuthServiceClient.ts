import { AbstractResponseDto } from '../../dto/common/AbstractResponseDto';
import {
    CreateOrganizationDto,
    OrganizationDto,
    OrganizationsListDto,
    UpdateOrganizationAvatarDto,
    UpdateOrganizationInfoDto,
} from '../../dto/organizations.views';
import { TokenResponseDto } from '../../dto/common/TokenResponseDto';
import axios, { AxiosRequestConfig } from 'axios';
import { AuthServiceApiError } from '../../exception/AuthServiceApiError';
import { ErrorResponseDto } from '../../dto/common/errors';
import {
    InviteMemberDto,
    OrganizationMembersListDto,
    UpdateMemberRolesDto,
    UpdateMemberUrlsDto,
} from '../../dto/organizationMembers.views';
import { MessageResponseDto } from '../../dto/common/MessageResponseDto';
import {
    UpdateUserInfoDto,
    UpdateUserProfilePictureDto,
    UserInfoDto,
    UserLoginDto,
    UserSignupDto,
} from '../../dto/users.views';
import { config } from '../../config';
import { logger } from '../../config/logger';
import { ShortCodeResponseDto } from '../../dto/common/ShortCodeResponseDto';
import { OrganizationScope } from '../../kafka/dto/userUpdates.views';

const API_AUTH_BASE = '/api/auth/v0';
const API_AUTH_USER = API_AUTH_BASE + '/user';
const API_AUTH_ADMIN = API_AUTH_BASE + '/admin';
const API_AUTH_PUBLIC = API_AUTH_BASE + '/public';

export class AuthServiceClient {
    private static async apiRequest<T>(
        axiosConfig: AxiosRequestConfig,
        accessToken?: string,
    ): Promise<T> {
        try {
            axiosConfig.baseURL = config.api.authServiceBaseUrl;
            if (accessToken) {
                axiosConfig.headers = {
                    ...(axiosConfig.headers || {}),
                    Authorization: accessToken,
                };
            }
            const response = await axios.request(axiosConfig);
            const resData: AbstractResponseDto<T> = response.data;
            return resData.payload;
        } catch (error: any) {
            if (error.response && error.response.data) {
                logger.error(JSON.stringify(error.response.data));
                throw new AuthServiceApiError(error.response.data as ErrorResponseDto);
            }
            throw error;
        }
    }

    /**
     * GET /api/auth/v0/user/organizations
     */
    static async getUserOrganizations(
        accessToken: string,
        params: { p?: number; q?: number; sb?: string; dir?: string; scope: OrganizationScope },
    ): Promise<OrganizationsListDto> {
        return AuthServiceClient.apiRequest<OrganizationsListDto>(
            {
                method: 'get',
                url: `${API_AUTH_USER}/organizations`,
                params,
            },
            accessToken,
        );
    }

    /**
     * GET /api/auth/v0/user/organizations/:slug
     */
    static async getUserOrganizationBySlug(
        accessToken: string,
        slug: string,
    ): Promise<OrganizationDto> {
        return AuthServiceClient.apiRequest<OrganizationDto>(
            {
                method: 'get',
                url: `${API_AUTH_USER}/organizations/${slug}`,
            },
            accessToken,
        );
    }

    /**
     * POST /api/auth/v0/user/organizations
     */
    static async createNewOrganization(
        accessToken: string,
        data: CreateOrganizationDto,
    ): Promise<TokenResponseDto> {
        return AuthServiceClient.apiRequest<TokenResponseDto>(
            {
                method: 'post',
                url: `${API_AUTH_USER}/organizations`,
                data,
            },
            accessToken,
        );
    }

    /**
     * PATCH /api/auth/v0/user/organizations/:slug
     */
    static async updateOrganizationInfo(
        accessToken: string,
        slug: string,
        data: UpdateOrganizationInfoDto,
    ): Promise<OrganizationDto> {
        return AuthServiceClient.apiRequest<OrganizationDto>(
            {
                method: 'patch',
                url: `${API_AUTH_USER}/organizations/${slug}`,
                data,
            },
            accessToken,
        );
    }

    /**
     * PUT /api/auth/v0/user/organizations/:slug/avatar
     */
    static async updateOrganizationAvatar(
        accessToken: string,
        slug: string,
        data: UpdateOrganizationAvatarDto,
    ): Promise<OrganizationDto> {
        return AuthServiceClient.apiRequest<OrganizationDto>(
            {
                method: 'put',
                url: `${API_AUTH_USER}/organizations/${slug}/avatar`,
                data,
            },
            accessToken,
        );
    }

    /**
     * DELETE /api/auth/v0/user/organizations/:slug/avatar
     */
    static async deleteOrganizationAvatar(
        accessToken: string,
        slug: string,
    ): Promise<OrganizationDto> {
        return AuthServiceClient.apiRequest<OrganizationDto>(
            {
                method: 'delete',
                url: `${API_AUTH_USER}/organizations/${slug}/avatar`,
            },
            accessToken,
        );
    }

    /**
     * DELETE /api/auth/v0/user/organizations/:slug
     */
    static async deleteOrganization(accessToken: string, slug: string): Promise<TokenResponseDto> {
        return AuthServiceClient.apiRequest<TokenResponseDto>(
            {
                method: 'delete',
                url: `${API_AUTH_USER}/organizations/${slug}`,
            },
            accessToken,
        );
    }

    /**
     * GET /api/auth/v0/user/organizations/:slug/members
     */
    static async getOrganizationMembers(
        accessToken: string,
        slug: string,
        params: { p?: number; q?: number; sb?: string; dir?: string },
    ): Promise<OrganizationMembersListDto> {
        return AuthServiceClient.apiRequest<OrganizationMembersListDto>(
            {
                method: 'get',
                url: `${API_AUTH_USER}/organizations/${slug}/members`,
                params,
            },
            accessToken,
        );
    }

    /**
     * POST /api/auth/v0/user/organizations/:slug/members
     */
    static async inviteNewOrganizationMember(
        accessToken: string,
        slug: string,
        data: InviteMemberDto,
    ): Promise<MessageResponseDto> {
        return AuthServiceClient.apiRequest<MessageResponseDto>(
            {
                method: 'post',
                url: `${API_AUTH_USER}/organizations/${slug}/members`,
                data,
            },
            accessToken,
        );
    }

    /**
     * PUT /api/auth/v0/user/organizations/:slug/members/:memberId/roles
     */
    static async updateOrganizationMemberRoles(
        accessToken: string,
        slug: string,
        memberId: number,
        data: UpdateMemberRolesDto,
    ): Promise<MessageResponseDto> {
        return AuthServiceClient.apiRequest<MessageResponseDto>(
            {
                method: 'put',
                url: `${API_AUTH_USER}/organizations/${slug}/members/${memberId}/roles`,
                data,
            },
            accessToken,
        );
    }

    /**
     * PUT /api/auth/v0/user/organizations/:slug/members/:memberId/urls
     */
    static async updateOrganizationMemberUrls(
        accessToken: string,
        slug: string,
        memberId: number,
        data: UpdateMemberUrlsDto,
    ): Promise<MessageResponseDto> {
        return AuthServiceClient.apiRequest<MessageResponseDto>(
            {
                method: 'put',
                url: `${API_AUTH_USER}/organizations/${slug}/members/${memberId}/urls`,
                data,
            },
            accessToken,
        );
    }

    /**
     * DELETE /api/auth/v0/user/organizations/:slug/members/:memberId
     */
    static async deleteOrganizationMember(
        accessToken: string,
        slug: string,
        memberId: number,
    ): Promise<MessageResponseDto> {
        return AuthServiceClient.apiRequest<MessageResponseDto>(
            {
                method: 'delete',
                url: `${API_AUTH_USER}/organizations/${slug}/members/${memberId}`,
            },
            accessToken,
        );
    }

    /**
     * GET /api/auth/v0/user/personal-info
     */
    static async getPersonalInfo(accessToken: string): Promise<UserInfoDto> {
        return AuthServiceClient.apiRequest<UserInfoDto>(
            {
                method: 'get',
                url: `${API_AUTH_USER}/personal-info`,
            },
            accessToken,
        );
    }

    /**
     * PATCH /api/auth/v0/user/personal-info
     */
    static async updateUserInfo(
        accessToken: string,
        data: UpdateUserInfoDto,
    ): Promise<UserInfoDto> {
        return AuthServiceClient.apiRequest<UserInfoDto>(
            {
                method: 'patch',
                url: `${API_AUTH_USER}/personal-info`,
                data,
            },
            accessToken,
        );
    }

    /**
     * PUT /api/auth/v0/user/profile-picture
     */
    static async updateProfilePicture(
        accessToken: string,
        data: UpdateUserProfilePictureDto,
    ): Promise<UserInfoDto> {
        return AuthServiceClient.apiRequest<UserInfoDto>(
            {
                method: 'put',
                url: `${API_AUTH_USER}/profile-picture`,
                data,
            },
            accessToken,
        );
    }

    /**
     * DELETE /api/auth/v0/user/profile-picture
     */
    static async deleteProfilePicture(accessToken: string): Promise<UserInfoDto> {
        return AuthServiceClient.apiRequest<UserInfoDto>(
            {
                method: 'delete',
                url: `${API_AUTH_USER}/profile-picture`,
            },
            accessToken,
        );
    }

    /**
     * GET /api/auth/v0/public/users/exchange-short-code/:shortCode
     */
    static async exchangeShortCode(shortCode: string): Promise<TokenResponseDto> {
        return AuthServiceClient.apiRequest<TokenResponseDto>({
            method: 'get',
            url: `${API_AUTH_PUBLIC}/users/exchange-short-code/${shortCode}`,
        });
    }

    /**
     * POST /api/auth/v0/public/users/signup
     */
    static async signup(data: UserSignupDto): Promise<TokenResponseDto> {
        return AuthServiceClient.apiRequest<TokenResponseDto>({
            method: 'post',
            url: `${API_AUTH_PUBLIC}/users/signup`,
            data,
        });
    }

    /**
     * POST /api/auth/v0/public/users/login
     */
    static async login(data: UserLoginDto): Promise<TokenResponseDto> {
        return AuthServiceClient.apiRequest<TokenResponseDto>({
            method: 'post',
            url: `${API_AUTH_PUBLIC}/users/login`,
            data,
        });
    }

    /**
     * POST /api/auth/v0/public/users/login
     */
    static async loginAsUserByAdmin(
        userId: number,
        adminAccessToken: string,
    ): Promise<ShortCodeResponseDto> {
        return AuthServiceClient.apiRequest<ShortCodeResponseDto>({
            method: 'get',
            url: `${API_AUTH_ADMIN}/users/${userId}/login-as-user`,
            headers: {
                Authorization: adminAccessToken,
            },
        });
    }

    /**
     * POST /api/auth/v0/admin/users/{userId}/info
     */
    static async updateUserSystemRoleByAdmin(
        userId: number,
        adminAccessToken: string,
    ): Promise<TokenResponseDto> {
        return AuthServiceClient.apiRequest<TokenResponseDto>({
            method: 'patch',
            url: `${API_AUTH_ADMIN}/users/${userId}/info`,
            headers: {
                Authorization: adminAccessToken,
            },
            data: { newRole: 'ADMIN' },
        });
    }

    /**
     * GET /api/auth/v0/public/users/refresh-token
     */
    static async refreshToken(refreshToken?: string): Promise<TokenResponseDto> {
        return AuthServiceClient.apiRequest<TokenResponseDto>({
            method: 'get',
            url: `${API_AUTH_PUBLIC}/users/refresh`,
            headers: {
                Authorization: refreshToken,
            },
        });
    }
}
