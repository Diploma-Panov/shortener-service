import {
    createShortUrlForOrganization,
    createTestApplication,
    signupRandomUser,
} from '../../../../../utils/apiUtils';
import { apiRouter } from '../../../../../../routes/api/shrt/v0';
import { resolutionsRouter } from '../../../../../../routes/api/shrt/v0/r/resolutions.controller';
import { ChangeUrlStateDto } from '../../../../../../dto/shortUrls.views';
import { ShortUrlState } from '../../../../../../db/model';
import request from 'supertest';
import { config } from '../../../../../../config';
import {
    PeriodCountDto,
    PeriodCountsDto,
    StatsPeriod,
} from '../../../../../../dto/statistics.views';

const apiApp = createTestApplication(apiRouter);
const rApp = createTestApplication(resolutionsRouter);

describe('Statistics test', () => {
    it('should get stats for url', async () => {
        const {
            tokens: { accessToken },
            organization: { slug },
        } = await signupRandomUser();

        const { url } = await createShortUrlForOrganization(slug, accessToken);

        const dto: ChangeUrlStateDto = {
            newState: ShortUrlState.ACTIVE,
        };
        const resState = await request(apiApp)
            .put(`/user/organizations/${slug}/urls/${url.id}`)
            .set('Authorization', accessToken)
            .send(dto);
        expect(resState.status).toEqual(200);

        const code: string = url.shortUrl.substring(config.urls.baseUrl.length + 1);
        const promises: Promise<any>[] = [];
        for (let i = 0; i < 123; ++i) {
            promises.push(request(rApp).get(`/${code}`).set('x-forwarded-for', '72.229.28.185')); // US, New York
        }
        for (let i = 0; i < 523; ++i) {
            promises.push(request(rApp).get(`/${code}`).set('x-forwarded-for', '210.138.184.59')); // JP
        }
        for (let i = 0; i < 222; ++i) {
            promises.push(request(rApp).get(`/${code}`).set('x-forwarded-for', '195.26.64.211')); // UA
        }
        for (let i = 0; i < 12; ++i) {
            promises.push(request(rApp).get(`/${code}`)); // XX
        }
        await Promise.all(promises);

        const res = await request(apiApp)
            .get(`/user/organizations/${slug}/urls/${url.id}/stats/global`)
            .set('Authorization', accessToken);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual({
            countryCounts: {
                US: 123,
                JP: 523,
                UA: 222,
                XX: expect.any(Number),
            },
            cityCounts: {
                'New York': 123,
            },
        });

        const now = new Date();
        now.setSeconds(0, 0);
        const start = new Date(now.getTime() - 60 * 1000).toISOString();
        const end = new Date(now.getTime() + 60 * 1000).toISOString();

        const resH = await request(apiApp)
            .get(`/user/organizations/${slug}/urls/${url.id}/stats/time-range`)
            .set('Authorization', accessToken)
            .query({
                start,
                end,
                period: StatsPeriod.HOUR,
            });
        expect(resH.status).toEqual(200);
        expect(resH.body.payload).toEqual<PeriodCountsDto>({
            counts: expect.arrayContaining<PeriodCountDto>([
                {
                    timestamp: start.substring(0, 13),
                    count: 880,
                },
            ]),
        });

        const resM = await request(apiApp)
            .get(`/user/organizations/${slug}/urls/${url.id}/stats/time-range`)
            .set('Authorization', accessToken)
            .query({
                start,
                end,
                period: StatsPeriod.MINUTE,
            });
        expect(resM.status).toEqual(200);
        expect(resM.body.payload).toEqual<PeriodCountsDto>({
            counts: expect.arrayContaining<PeriodCountDto>([
                {
                    timestamp: now.toISOString().substring(0, 16),
                    count: 880,
                },
            ]),
        });
    });
});
