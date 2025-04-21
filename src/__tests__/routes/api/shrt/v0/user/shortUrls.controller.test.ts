import {
    createShortUrlForOrganization,
    createTestApplication,
    inviteMemberInOrganization,
    signupRandomUser,
} from '../../../../../utils/apiUtils';
import { MemberRole, OrganizationAccessEntry } from '../../../../../../auth/common';
import request from 'supertest';
import { apiRouter } from '../../../../../../routes/api/shrt/v0';
import {
    CreateShortUrlDto,
    ShortUrlDto,
    ShortUrlsListDto,
    ShortUrlsSearchParams,
} from '../../../../../../dto/shortUrls.views';
import { generateRandomUrl } from '../../../../../../utils/dataUtils';
import { TokenResponseDto } from '../../../../../../dto/common/TokenResponseDto';
import { findUrlByIdThrowable } from '../../../../../../components/dao/shortUrls.dao';
import { parseJwtToken } from '../../../../../../auth/jwt';
import { ShortUrl, ShortUrlState, ShortUrlType } from '../../../../../../db/model';

const app = createTestApplication(apiRouter);

describe('Short URLs controller test', () => {
    it('should return list of short urls of organization with query params', async () => {
        const {
            tokens: { accessToken },
            organization: { slug },
        } = await signupRandomUser();

        const creationPromises = Array.from({ length: 15 }, (_, i) =>
            createShortUrlForOrganization(
                slug,
                accessToken,
                i % 2 === 0 ? ['even'] : ['odd']
            )
        );
        const results = await Promise.all(creationPromises);
        const urlIds: number[] = results.map(({ url: { id } }) => id);

        /**
         *  Without query params
         */
        const res1 = await request(app)
            .get(`/user/organizations/${slug}/urls`)
            .set('Authorization', accessToken);
        expect(res1.status).toEqual(200);
        expect(res1.body.payload).toEqual<ShortUrlsListDto>({
            entries: expect.arrayContaining([]),
            total: 15,
            hasMore: true,
            page: 0,
            perPage: 10,
        });

        /**
         * With pagination
         */
        const res2 = await request(app)
            .get(`/user/organizations/${slug}/urls`)
            .set('Authorization', accessToken)
            .query({
                p: 0,
                q: 14,
                tags: ['odd', 'test', 'a', 'b'],
            } as ShortUrlsSearchParams);
        expect(res2.status).toEqual(200);
        expect(res2.body.payload).toEqual<ShortUrlsListDto>({
            entries: expect.arrayContaining([]),
            total: 7,
            hasMore: false,
            page: 0,
            perPage: 14,
        });
        for (const urlId of res2.body.payload.entries.map((e: ShortUrlDto) => e.id)) {
            expect(urlIds).toContainEqual(urlId);
        }

        /**
         * By urls manager
         */
        const {
            user: {
                tokens: { accessToken: memberToken },
            },
        } = await inviteMemberInOrganization(slug, accessToken, {
            allowedUrls: [urlIds[0], urlIds[10]],
            allowedAllUrls: false,
        });
        const res3 = await request(app)
            .get(`/user/organizations/${slug}/urls`)
            .set('Authorization', memberToken);
        expect(res3.status).toEqual(200);
        expect(res3.body.payload).toEqual<ShortUrlsListDto>({
            entries: expect.arrayContaining([
                expect.objectContaining({
                    id: urlIds[0],
                }),
                expect.objectContaining({
                    id: urlIds[10],
                }),
            ]),
            total: 2,
            hasMore: false,
            page: 0,
            perPage: 10,
        });
    });

    it('should create short url', async () => {
        const {
            tokens: { accessToken },
            organization: { slug },
        } = await signupRandomUser();

        const {
            user: {
                tokens: { accessToken: memberAccessToken },
            },
        } = await inviteMemberInOrganization(slug, accessToken, {
            allowedAllUrls: false,
            allowedUrls: [],
            roles: [MemberRole.ORGANIZATION_MEMBER, MemberRole.ORGANIZATION_URLS_MANAGER],
        });

        const dto: CreateShortUrlDto = {
            originalUrl: generateRandomUrl(),
            tags: ['test'],
        };
        const res = await request(app)
            .post(`/user/organizations/${slug}/urls`)
            .set('Authorization', memberAccessToken)
            .send(dto);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<TokenResponseDto>({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
        });

        const newToken: string = res.body.payload.accessToken;
        const { organizations } = parseJwtToken(newToken);
        const o: OrganizationAccessEntry = organizations.find((o) => o.slug === slug)!;

        expect(o.allowedUrls).toHaveLength(1);
        const urlId: number = o.allowedUrls[0];

        const createdUrl: ShortUrl = await findUrlByIdThrowable(urlId);
        expect(createdUrl.originalUrl).toEqual(dto.originalUrl);

        /**
         *
         * Try to fetch urls with old and new tokens
         *
         */
        const fetchWithOld = await request(app)
            .get(`/user/organizations/${slug}/urls`)
            .set('Authorization', memberAccessToken);
        expect(fetchWithOld.status).toEqual(200);
        expect(fetchWithOld.body.payload).toEqual<ShortUrlsListDto>({
            entries: [],
            total: 0,
            hasMore: false,
            page: 0,
            perPage: 10,
        });

        const fetchWithNew = await request(app)
            .get(`/user/organizations/${slug}/urls`)
            .set('Authorization', newToken);
        expect(fetchWithNew.status).toEqual(200);
        expect(fetchWithNew.body.payload).toEqual<ShortUrlsListDto>({
            entries: expect.arrayContaining<ShortUrlDto>([
                {
                    id: createdUrl.id,
                    creatorName: expect.any(String),
                    originalUrl: createdUrl.originalUrl,
                    shortUrl: createdUrl.shortUrl,
                    state: ShortUrlState.PENDING,
                    type: ShortUrlType.REGULAR,
                    tags: ['test'],
                },
            ]),
            total: 1,
            hasMore: false,
            page: 0,
            perPage: 10,
        });
    });
});
