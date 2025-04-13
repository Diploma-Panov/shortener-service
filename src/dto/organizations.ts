import { PagedResponse } from './common/PagedResponse';
import { IsBase64, IsNotEmpty, IsOptional, IsUrl, Matches } from 'class-validator';

export class CreateOrganizationDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @Matches(/^(?!-)(?!.*--)[a-z0-9-]+(?<!-)$/, {
        message:
            'Value can only contain lowercase letters, digits, and single hyphens (-). It cannot start or end with a hyphen or contain consecutive hyphens.',
    })
    slug: string;

    @IsNotEmpty()
    scope: 'SHORTENER_SCOPE';

    @IsOptional()
    @IsUrl()
    url: string | null;

    description: string | null;

    @IsOptional()
    @IsBase64()
    avatarBase64: string | null;
}

export enum OrganizationType {
    PERMANENT = 'PERMANENT',
    MANUAL = 'MANUAL',
}

export interface OrganizationDto {
    id: number;
    name: string;
    slug: string;
    scope: 'SHORTENER_SCOPE';
    url: string | null;
    description: string | null;
    avatarUrl: string | null;
    type: OrganizationType;
    membersCount: number;
}

export interface OrganizationsListDto extends PagedResponse {
    entries: OrganizationDto[];
}

export class UpdateOrganizationAvatarDto {
    @IsBase64()
    @IsNotEmpty()
    newAvatarBase64: string;
}

export interface UpdateOrganizationInfoDto {
    newName?: string | null;
    newDescription?: string | null;
    newUrl?: string | null;
}
