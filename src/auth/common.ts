export enum MemberRole {
    ORGANIZATION_OWNER = 'ORGANIZATION_OWNER',
    ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN',
    ORGANIZATION_MEMBERS_MANAGER = 'ORGANIZATION_MEMBERS_MANAGER',
    ORGANIZATION_MANAGER = 'ORGANIZATION_MANAGER',
    ORGANIZATION_MEMBER = 'ORGANIZATION_MEMBER',
    ORGANIZATION_URLS_MANAGER = 'ORGANIZATION_URLS_MANAGER',
}

export enum MemberPermission {
    FULL_ACCESS = 'FULL_ACCESS',
    ADMIN_ACCESS = 'ADMIN_ACCESS',
    INVITE_MEMBERS = 'INVITE_MEMBERS',
    MANAGE_URLS = 'MANAGE_URLS',
    MANAGE_MEMBERS = 'MANAGE_MEMBERS',
    MANAGE_ORGANIZATION = 'MANAGE_ORGANIZATION',
    BASIC_VIEW = 'BASIC_VIEW',
}

export interface IMemberRoleDefinition {
    role: MemberRole;
    permissions: MemberPermission[];
}

export interface MemberRolesDefinitions {
    [key: string]: IMemberRoleDefinition;
}

export const allMemberRoles: MemberRolesDefinitions = {
    [MemberRole.ORGANIZATION_OWNER]: {
        role: MemberRole.ORGANIZATION_OWNER,
        permissions: [
            MemberPermission.FULL_ACCESS,
            MemberPermission.ADMIN_ACCESS,
            MemberPermission.INVITE_MEMBERS,
            MemberPermission.MANAGE_URLS,
            MemberPermission.MANAGE_MEMBERS,
            MemberPermission.MANAGE_ORGANIZATION,
            MemberPermission.BASIC_VIEW,
        ],
    },
    [MemberRole.ORGANIZATION_ADMIN]: {
        role: MemberRole.ORGANIZATION_ADMIN,
        permissions: [
            MemberPermission.ADMIN_ACCESS,
            MemberPermission.INVITE_MEMBERS,
            MemberPermission.MANAGE_URLS,
            MemberPermission.MANAGE_MEMBERS,
            MemberPermission.MANAGE_ORGANIZATION,
            MemberPermission.BASIC_VIEW,
        ],
    },
    [MemberRole.ORGANIZATION_MEMBERS_MANAGER]: {
        role: MemberRole.ORGANIZATION_MEMBERS_MANAGER,
        permissions: [
            MemberPermission.BASIC_VIEW,
            MemberPermission.MANAGE_MEMBERS,
            MemberPermission.INVITE_MEMBERS,
        ],
    },
    [MemberRole.ORGANIZATION_MANAGER]: {
        role: MemberRole.ORGANIZATION_MANAGER,
        permissions: [MemberPermission.BASIC_VIEW, MemberPermission.MANAGE_ORGANIZATION],
    },
    [MemberRole.ORGANIZATION_MEMBER]: {
        role: MemberRole.ORGANIZATION_MEMBER,
        permissions: [MemberPermission.BASIC_VIEW],
    },
    [MemberRole.ORGANIZATION_URLS_MANAGER]: {
        role: MemberRole.ORGANIZATION_URLS_MANAGER,
        permissions: [MemberPermission.BASIC_VIEW, MemberPermission.MANAGE_URLS],
    },
};

export const getAllPermissions = (roles: MemberRole[]): Set<MemberPermission> => {
    const permissionsSet = new Set<MemberPermission>();
    for (const role of roles) {
        for (const permission of allMemberRoles[role].permissions) permissionsSet.add(permission);
    }
    return permissionsSet;
};

export const hasPermission = (roles: MemberRole[], permission: MemberPermission): boolean => {
    return getAllPermissions(roles).has(permission);
};

export enum UserSystemRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

export enum LoginType {
    USER_LOGIN = 'USER_LOGIN',
    ADMIN_LOGIN = 'ADMIN_LOGIN',
    SYSTEM_LOGIN = 'SYSTEM_LOGIN',
}

export interface OrganizationAccessEntry {
    organizationId: number;
    slug: string;
    allowedUrls: number[];
    allowedAllUrls: boolean;
    roles: MemberRole[];
}

export interface JwtUserSubject {
    userId: number;
    username: string;
    userSystemRole: UserSystemRole;
    loginType: LoginType;
    firstname: string;
    lastname: string;
    organizations: OrganizationAccessEntry[];
}

export interface JwtPayload {
    exp: number;
    iat: number;
    sub: string;
}
