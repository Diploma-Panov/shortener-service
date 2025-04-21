import {
    createShortUrlForOrganization,
    createTestApplication,
    signupRandomUser,
} from '../../utils/apiUtils';
import { resolutionsRouter } from '../../../routes/api/shrt/v0/r/resolutions.controller';
import request from 'supertest';
import { ErrorResponseDto } from '../../../dto/common/errors';
import { config } from '../../../config';
import { apiRouter } from '../../../routes/api/shrt/v0';
import { ChangeUrlStateDto } from '../../../dto/shortUrls.views';
import { ShortUrlState } from '../../../db/model';

const app = createTestApplication(resolutionsRouter);

describe('Resolutions test', () => {
    it('should throw if short url does not exist', async () => {
        const res = await request(app).get('/ajsdfj');
        expect(res.status).toEqual(404);
        expect(res.body).toEqual<ErrorResponseDto>({
            errors: [
                {
                    errorClass: 'NotFoundError',
                    errorType: 'ENTITY_NOT_FOUND',
                    errorMessage: `Could not find ShortUrl with shortUrl=${config.urls.baseUrl}/ajsdfj`,
                },
            ],
        });
    });

    it('should resolve short url', async () => {
        const {
            tokens: { accessToken },
            organization: { slug },
        } = await signupRandomUser();
        const {
            url: { shortUrl, originalUrl, id },
        } = await createShortUrlForOrganization(slug, accessToken);
        const code: string = shortUrl.substring(config.urls.baseUrl.length + 1);

        const dto: ChangeUrlStateDto = {
            newState: ShortUrlState.ACTIVE,
        };
        await request(createTestApplication(apiRouter))
            .put(`/user/organizations/${slug}/urls/${id}`)
            .set('Authorization', accessToken)
            .send(dto);

        const res = await request(app).get(`/${code}`);
        expect(res.status).toEqual(302);
        expect(res.headers.location).toEqual(originalUrl);
    });
});
