export enum OrganizationScope {
    SHORTENER_SCOPE = 'SHORTENER_SCOPE',
}

export interface KafkaOrganizationUpdateDto {
    id: number;
    name: string;
    slug: string;
    siteUrl: string | null;
    description: string | null;
    scope: OrganizationScope;
}

export interface KafkaOrganizationMembersUpdateDto {
    id: number;
    organizationId: number;
    displayFirstname: string | null;
    displayLastname: string | null;
}

export interface KafkaUserUpdateDto {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    organizationsCreatedByUser: KafkaOrganizationUpdateDto[];
    members: KafkaOrganizationMembersUpdateDto[];
}
