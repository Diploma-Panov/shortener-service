import {
    bigint,
    customType,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { SHORT_URL_STATES, SHORT_URL_TYPES } from './model';

export const Users = pgTable('users', {
    id: serial('id').primaryKey(),
    firstname: varchar('first_name', { length: 255 }).notNull(),
    lastname: varchar('last_name', { length: 255 }),
    email: varchar('email', { length: 255 }).unique('user-email-unique'),
});

export const Organizations = pgTable('organizations', {
    id: serial('id').primaryKey(),
    creatorUserId: bigint('creator_user_id', { mode: 'bigint' })
        .notNull()
        .references(() => Users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    siteUrl: varchar('site_url', { length: 255 }),
    description: text('description'),
});

export const OrganizationMembers = pgTable('organization_members', {
    id: serial('id').primaryKey(),
    memberUserId: bigint('member_user_id', { mode: 'bigint' })
        .notNull()
        .references(() => Users.id, { onDelete: 'cascade' }),
    organizationId: bigint('organization_id', { mode: 'bigint' })
        .notNull()
        .references(() => Organizations.id, { onDelete: 'cascade' }),
    displayFirstname: varchar('display_firstname', { length: 255 }),
    displayLastname: varchar('display_lastname', { length: 255 }),
});

export const ShortUrlStatePgEnum = pgEnum('short_url_state', SHORT_URL_STATES);
export const ShortUrlTypePgEnum = pgEnum('short_url_type', SHORT_URL_TYPES);

const textArray = customType<{
    data: string[];
    driverData: string;
}>({
    dataType() {
        return 'text[]';
    },
});

export const ShortUrls = pgTable('short_urls', {
    id: serial('id').primaryKey(),
    creatorMemberId: bigint('creator_member_id', { mode: 'bigint' })
        .notNull()
        .references(() => Users.id, { onDelete: 'cascade' }),
    owningOrganizationId: bigint('owning_organization_id', { mode: 'bigint' })
        .notNull()
        .references(() => Organizations.id, { onDelete: 'cascade' }),
    originalUrl: varchar('original_url', { length: 1024 }).notNull(),
    shortUrl: varchar('short_url', { length: 63 }).notNull(),
    shortUrlState: ShortUrlStatePgEnum('short_url_state').notNull(),
    shortUrlType: ShortUrlTypePgEnum('short_url_type').notNull(),
    tags: textArray('tags').notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
