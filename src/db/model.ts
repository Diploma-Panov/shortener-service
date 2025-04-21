import { InferSelectModel } from 'drizzle-orm';
import { OrganizationMembers, Organizations, ShortUrls, Users } from './schema';

export type User = InferSelectModel<typeof Users>;

export type Organization = InferSelectModel<typeof Organizations>;

export type OrganizationMember = InferSelectModel<typeof OrganizationMembers>;

export type ShortUrl = InferSelectModel<typeof ShortUrls>;

export const SHORT_URL_TYPES = ['TRIAL', 'REGULAR'] as const;

export const SHORT_URL_STATES = ['PENDING', 'ACTIVE', 'NOT_ACTIVE', 'ARCHIVED'] as const;

export enum ShortUrlType {
    TRIAL = 'TRIAL',
    REGULAR = 'REGULAR',
}

export enum ShortUrlState {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    NOT_ACTIVE = 'NOT_ACTIVE',
    ARCHIVED = 'ARCHIVED',
}
