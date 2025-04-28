import { MemberRole } from '../auth/common';
import { PagedResponse } from './common/PagedResponse';
import { ArrayNotEmpty, IsArray, IsBoolean, IsDefined, IsEmail, IsNotEmpty } from 'class-validator';

export class InviteMemberDto {
    @IsNotEmpty()
    firstname: string;

    @IsNotEmpty()
    lastname: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsBoolean()
    @IsDefined()
    allowedAllUrls: boolean;

    @IsDefined()
    @IsArray()
    allowedUrls: number[];

    @IsDefined()
    @IsArray()
    @ArrayNotEmpty()
    roles: MemberRole[];
}

export interface OrganizationMemberDto {
    id: number;
    organizationId: number;
    fullName: string;
    email: string;
    roles: MemberRole[];
    allowedUrls: number[];
    allowedAllUrls: boolean;
    pictureUrl?: string | null;
}

export interface OrganizationMembersListDto extends PagedResponse {
    entries: OrganizationMemberDto[];
}

export interface UpdateMemberRolesDto {
    newRoles: MemberRole[];
}

export interface UpdateMemberUrlsDto {
    newUrlsIds: number[];
    allowedAllUrls: boolean;
}
