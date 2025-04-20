import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../../db/drizzle';
import { ShortUrlDto, ShortUrlsListDto, ShortUrlsSearchParams } from '../../dto/shortUrls.views';
import { ShortUrls, Users, OrganizationMembers, Organizations } from '../../db/schema';

export async function getShortUrlsListBySlug(
    slug: string,
    params: ShortUrlsSearchParams,
): Promise<ShortUrlsListDto> {
    const { p = 0, q = 10, tags, s, t, sb, dir } = params;

    const orderByField = sb === 'shortUrl' ? ShortUrls.shortUrl : ShortUrls.originalUrl;
    const orderDirection = dir === 'desc' ? 'DESC' : 'ASC';
    const orderExpr = sql`${orderByField} ${orderDirection}`;

    const whereClauses = [eq(Organizations.slug, slug)];

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
        .select({ count: sql<number>`count(*)` })
        .from(ShortUrls)
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
        .innerJoin(Users, eq(Users.id, ShortUrls.creatorMemberId))
        .leftJoin(
            OrganizationMembers,
            and(
                eq(OrganizationMembers.memberUserId, Users.id),
                eq(OrganizationMembers.organizationId, Organizations.id),
            ),
        )
        .where(and(...whereClauses))
        .orderBy(orderExpr)
        .limit(q)
        .offset(p * q);

    const entries: ShortUrlDto[] = rows.map((u) => {
        const first = u.creatorDisplay?.firstname || u.creatorUser.firstname;
        const last = u.creatorDisplay?.lastname || u.creatorUser.lastname || '';
        const creatorName = last ? `${first} ${last}` : first;
        return {
            id: u.id,
            creatorName,
            originalUrl: u.originalUrl,
            shortUrl: u.shortUrl,
            state: u.state,
            type: u.type,
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
