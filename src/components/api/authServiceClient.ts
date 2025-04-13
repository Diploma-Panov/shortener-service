import { AbstractResponseDto } from '../../dto/common/AbstractResponseDto';
import {
    CreateOrganizationDto,
    OrganizationDto,
    OrganizationsListDto,
    UpdateOrganizationAvatarDto,
    UpdateOrganizationInfoDto,
} from '../../dto/organizations';
import { TokenResponseDto } from '../../dto/common/TokenResponseDto';
import axios, { AxiosRequestConfig } from 'axios';
import { AuthServiceApiError } from '../../exception/AuthServiceApiError';
import { ErrorResponseDto } from '../../dto/common/errors';
import {
    InviteMemberDto,
    OrganizationMembersListDto,
    UpdateMemberRolesDto,
    UpdateMemberUrlsDto,
} from '../../dto/organizationMembers';
import { MessageResponseDto } from '../../dto/common/MessageResponseDto';
import {
    UpdateUserInfoDto,
    UpdateUserProfilePictureDto,
    UserInfoDto,
    UserSignupDto,
} from '../../dto/users';

const API_AUTH_BASE = '/api/auth';
const API_AUTH_USER = API_AUTH_BASE + '/v0/user';
const API_AUTH_PUBLIC = API_AUTH_BASE + '/v0/public';

async function apiRequest<T>(config: AxiosRequestConfig, accessToken?: string): Promise<T> {
    try {
        if (accessToken) {
            config.headers = {
                ...(config.headers || {}),
                Authorization: accessToken,
            };
        }
        const response = await axios.request(config);
        const resData: AbstractResponseDto<T> = response.data;
        return resData.payload;
    } catch (error: any) {
        if (error.response && error.response.data) {
            throw new AuthServiceApiError(error.response.data as ErrorResponseDto);
        }
        throw error;
    }
}

/**
 * GET /api/auth/v0/user/organizations
 */
export const getUserOrganizations = async (
    accessToken: string,
    params: { p?: number; q?: number; sb?: string; dir?: string },
): Promise<OrganizationsListDto> => {
    return apiRequest<OrganizationsListDto>(
        {
            method: 'get',
            url: `${API_AUTH_USER}/organizations`,
            params,
        },
        accessToken,
    );
};

/**
 * GET /api/auth/v0/user/organizations/:slug
 */
export const getUserOrganizationBySlug = async (
    accessToken: string,
    slug: string,
): Promise<OrganizationDto> => {
    return apiRequest<OrganizationDto>(
        {
            method: 'get',
            url: `${API_AUTH_USER}/organizations/${slug}`,
        },
        accessToken,
    );
};

/**
 * POST /api/auth/v0/user/organizations
 */
export const createNewOrganization = async (
    accessToken: string,
    data: CreateOrganizationDto,
): Promise<TokenResponseDto> => {
    return apiRequest<TokenResponseDto>(
        {
            method: 'post',
            url: `${API_AUTH_USER}/organizations`,
            data,
        },
        accessToken,
    );
};

/**
 * PATCH /api/auth/v0/user/organizations/:slug
 */
export const updateOrganizationInfo = async (
    accessToken: string,
    slug: string,
    data: UpdateOrganizationInfoDto,
): Promise<OrganizationDto> => {
    return apiRequest<OrganizationDto>(
        {
            method: 'patch',
            url: `${API_AUTH_USER}/organizations/${slug}`,
            data,
        },
        accessToken,
    );
};

/**
 * PUT /api/auth/v0/user/organizations/:slug/avatar
 */
export const updateOrganizationAvatar = async (
    accessToken: string,
    slug: string,
    data: UpdateOrganizationAvatarDto,
): Promise<OrganizationDto> => {
    return apiRequest<OrganizationDto>(
        {
            method: 'put',
            url: `${API_AUTH_USER}/organizations/${slug}/avatar`,
            data,
        },
        accessToken,
    );
};

/**
 * DELETE /api/auth/v0/user/organizations/:slug/avatar
 */
export const deleteOrganizationAvatar = async (
    accessToken: string,
    slug: string,
): Promise<OrganizationDto> => {
    return apiRequest<OrganizationDto>(
        {
            method: 'delete',
            url: `${API_AUTH_USER}/organizations/${slug}/avatar`,
        },
        accessToken,
    );
};

/**
 * DELETE /api/auth/v0/user/organizations/:slug
 */
export const deleteOrganization = async (
    accessToken: string,
    slug: string,
): Promise<TokenResponseDto> => {
    return apiRequest<TokenResponseDto>(
        {
            method: 'delete',
            url: `${API_AUTH_USER}/organizations/${slug}`,
        },
        accessToken,
    );
};

/**
 * GET /api/auth/v0/user/organizations/:slug/members
 */
export const getOrganizationMembers = async (
    accessToken: string,
    slug: string,
    params: { p?: number; q?: number; sb?: string; dir?: string },
): Promise<OrganizationMembersListDto> => {
    return apiRequest<OrganizationMembersListDto>(
        {
            method: 'get',
            url: `${API_AUTH_USER}/organizations/${slug}/members`,
            params,
        },
        accessToken,
    );
};

/**
 * POST /api/auth/v0/user/organizations/:slug/members
 */
export const inviteNewOrganizationMember = async (
    accessToken: string,
    slug: string,
    data: InviteMemberDto,
): Promise<MessageResponseDto> => {
    return apiRequest<MessageResponseDto>(
        {
            method: 'post',
            url: `${API_AUTH_USER}/organizations/${slug}/members`,
            data,
        },
        accessToken,
    );
};

/**
 * PUT /api/auth/v0/user/organizations/:slug/members/:memberId/roles
 */
export const updateOrganizationMemberRoles = async (
    accessToken: string,
    slug: string,
    memberId: number,
    data: UpdateMemberRolesDto,
): Promise<MessageResponseDto> => {
    return apiRequest<MessageResponseDto>(
        {
            method: 'put',
            url: `${API_AUTH_USER}/organizations/${slug}/members/${memberId}/roles`,
            data,
        },
        accessToken,
    );
};

/**
 * PUT /api/auth/v0/user/organizations/:slug/members/:memberId/urls
 */
export const updateOrganizationMemberUrls = async (
    accessToken: string,
    slug: string,
    memberId: number,
    data: UpdateMemberUrlsDto,
): Promise<MessageResponseDto> => {
    return apiRequest<MessageResponseDto>(
        {
            method: 'put',
            url: `${API_AUTH_USER}/organizations/${slug}/members/${memberId}/urls`,
            data,
        },
        accessToken,
    );
};

/**
 * DELETE /api/auth/v0/user/organizations/:slug/members/:memberId
 */
export const deleteOrganizationMember = async (
    accessToken: string,
    slug: string,
    memberId: number,
): Promise<MessageResponseDto> => {
    return apiRequest<MessageResponseDto>(
        {
            method: 'delete',
            url: `${API_AUTH_USER}/organizations/${slug}/members/${memberId}`,
        },
        accessToken,
    );
};

/**
 * GET /api/auth/v0/user/personal-info
 */
export const getPersonalInfo = async (accessToken: string): Promise<UserInfoDto> => {
    return apiRequest<UserInfoDto>(
        {
            method: 'get',
            url: `${API_AUTH_USER}/personal-info`,
        },
        accessToken,
    );
};

/**
 * PATCH /api/auth/v0/user/personal-info
 */
export const updateUserInfo = async (
    accessToken: string,
    data: UpdateUserInfoDto,
): Promise<UserInfoDto> => {
    return apiRequest<UserInfoDto>(
        {
            method: 'patch',
            url: `${API_AUTH_USER}/personal-info`,
            data,
        },
        accessToken,
    );
};

/**
 * PUT /api/auth/v0/user/profile-picture
 */
export const updateProfilePicture = async (
    accessToken: string,
    data: UpdateUserProfilePictureDto,
): Promise<UserInfoDto> => {
    return apiRequest<UserInfoDto>(
        {
            method: 'put',
            url: `${API_AUTH_USER}/profile-picture`,
            data,
        },
        accessToken,
    );
};

/**
 * DELETE /api/auth/v0/user/profile-picture
 */
export const deleteProfilePicture = async (accessToken: string): Promise<UserInfoDto> => {
    return apiRequest<UserInfoDto>(
        {
            method: 'delete',
            url: `${API_AUTH_USER}/profile-picture`,
        },
        accessToken,
    );
};

/**
 * GET /api/auth/v0/public/users/exchange-short-code/:shortCode
 */
export const exchangeShortCode = async (shortCode: string): Promise<TokenResponseDto> => {
    return apiRequest<TokenResponseDto>({
        method: 'get',
        url: `${API_AUTH_PUBLIC}/users/exchange-short-code/${shortCode}`,
    });
};

/**
 * POST /api/auth/v0/public/users/signup
 */
export const signup = async (data: UserSignupDto): Promise<TokenResponseDto> => {
    return apiRequest<TokenResponseDto>({
        method: 'post',
        url: `${API_AUTH_PUBLIC}/users/signup`,
        data,
    });
};
