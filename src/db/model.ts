import { InferSelectModel } from 'drizzle-orm';
import { OrganizationMembers, Organizations, ShortUrls, ShortUrlTypePgEnum, Users } from './schema';

export type User = InferSelectModel<typeof Users>;

export type Organization = InferSelectModel<typeof Organizations>;

export type OrganizationMember = InferSelectModel<typeof OrganizationMembers>;

export type ShortUrl = InferSelectModel<typeof ShortUrls>;

export const SHORT_URL_TYPES = ['TRIAL', 'REGULAR'] as const;
export type ShortUrlType = (typeof SHORT_URL_TYPES)[number];

export const SHORT_URL_STATES = ['PENDING', 'ACTIVE', 'NOT_ACTIVE', 'ARCHIVED'] as const;
export type ShortUrlState = (typeof SHORT_URL_STATES)[number];
