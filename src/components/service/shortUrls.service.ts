import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../db/drizzle';
import {
    CreateShortUrlDto,
    ShortUrlDto,
    ShortUrlsListDto,
    ShortUrlsSearchParams,
} from '../../dto/shortUrls.views';
import { ShortUrls, Users, OrganizationMembers, Organizations } from '../../db/schema';
import { OrganizationMember, ShortUrl, ShortUrlState, ShortUrlType } from '../../db/model';
import { findMemberByUserIdAndOrganizationSlugThrowable } from '../dao/organizationMember.dao';
import { config } from '../../config';
import { generateRandomAlphabeticalString } from '../../utils/dataUtils';
import { AuthServiceClient } from '../api/AuthServiceClient';
import { UpdateMemberUrlsDto } from '../../dto/organizationMembers.views';
import { TokenResponseDto } from '../../dto/common/TokenResponseDto';

export async function getShortUrlsListBySlug(
    slug: string,
    params: ShortUrlsSearchParams,
    allowedUrls: number[],
    allowedAllUrls: boolean,
): Promise<ShortUrlsListDto> {
    const { p = 0, q = 10, tags, s, t, sb, dir } = params;

    const orderByField = sb === 'shortUrl' ? ShortUrls.shortUrl : ShortUrls.originalUrl;
    const orderDirection = dir === 'desc' ? 'DESC' : 'ASC';

    const whereClauses = [eq(Organizations.slug, slug)];

    if (!allowedAllUrls) {
        whereClauses.push(inArray(ShortUrls.id, allowedUrls));
    }

    if (tags?.length) {
        const tagClauses = tags.map((tag) => sql`${tag} = ANY(${ShortUrls.tags})`);
        whereClauses.push(sql`(${sql.join(tagClauses, sql` OR `)})`);
    }

    if (s?.length) {
        whereClauses.push(inArray(ShortUrls.shortUrlState, s));
    }

    if (t?.length) {
        whereClauses.push(inArray(ShortUrls.shortUrlType, t));
    }

    const [totalRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(ShortUrls)
        .innerJoin(Organizations, eq(Organizations.id, ShortUrls.owningOrganizationId))
        .where(and(...whereClauses));

    const rows = await db
        .select({
            id: ShortUrls.id,
            originalUrl: ShortUrls.originalUrl,
            shortUrl: ShortUrls.shortUrl,
            state: ShortUrls.shortUrlState,
            type: ShortUrls.shortUrlType,
            tags: ShortUrls.tags,
            creatorUser: {
                firstname: Users.firstname,
                lastname: Users.lastname,
            },
            creatorDisplay: {
                firstname: OrganizationMembers.displayFirstname,
                lastname: OrganizationMembers.displayLastname,
            },
        })
        .from(ShortUrls)
        .innerJoin(Organizations, eq(Organizations.id, ShortUrls.owningOrganizationId))
        .leftJoin(
            OrganizationMembers,
            and(
                eq(OrganizationMembers.id, ShortUrls.creatorMemberId),
                eq(OrganizationMembers.organizationId, Organizations.id),
            ),
        )
        .leftJoin(Users, eq(Users.id, OrganizationMembers.memberUserId))
        .where(and(...whereClauses))
        .orderBy(orderDirection === 'ASC' ? asc(orderByField) : desc(orderByField))
        .limit(q)
        .offset(p * q);

    const entries: ShortUrlDto[] = rows.map((u) => {
        const first = u.creatorDisplay?.firstname || u.creatorUser?.firstname;
        const last = u.creatorDisplay?.lastname || u.creatorUser?.lastname || '';
        let creatorName: string = '';
        if (first) {
            creatorName = last ? `${first} ${last}` : first;
        }
        return {
            id: u.id,
            creatorName,
            originalUrl: u.originalUrl,
            shortUrl: u.shortUrl,
            state: u.state as ShortUrlState,
            type: u.type as ShortUrlType,
            tags: u.tags,
        };
    });

    return {
        total: totalRow.count || 0,
        page: p,
        perPage: q,
        hasMore: (p + 1) * q < (totalRow.count || 0),
        entries,
    };
}

export const createNewShortUrlForOrganization = async (
    slug: string,
    userId: number,
    dto: CreateShortUrlDto,
    currentMemberUrls: { allowedAllUrls: boolean; allowedUrls: number[] },
): Promise<{ tokens: TokenResponseDto; url: ShortUrl }> => {
    const member: OrganizationMember = await findMemberByUserIdAndOrganizationSlugThrowable(
        slug,
        BigInt(userId),
    );
    const newUrl = {
        ...dto,
        creatorMemberId: BigInt(member.id),
        owningOrganizationId: BigInt(member.organizationId),
        shortUrl: config.urls.baseUrl + `/${generateRandomAlphabeticalString(6)}`,
        shortUrlState: ShortUrlState.PENDING,
        shortUrlType: ShortUrlType.REGULAR,
    };

    const [inserted] = await db.insert(ShortUrls).values(newUrl).returning();

    let updatePermissionsDto: UpdateMemberUrlsDto;
    if (currentMemberUrls.allowedAllUrls) {
        updatePermissionsDto = {
            newUrlsIds: [],
            allowedAllUrls: true,
        };
    } else {
        updatePermissionsDto = {
            newUrlsIds: [...currentMemberUrls.allowedUrls, inserted.id],
            allowedAllUrls: false,
        };
    }
    return {
        tokens: await AuthServiceClient.updateMemberUrlsBySystem(member.id, updatePermissionsDto),
        url: inserted,
    };
};
