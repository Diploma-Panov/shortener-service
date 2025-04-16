import {
    createOrganizationForUser,
    createTestApplication,
    signupRandomUser,
} from '../../../../../utils/apiUtils';
import { apiRouter } from '../../../../../../routes/api/shrt/v0';
import request from 'supertest';
import { OrganizationScope } from '../../../../../../kafka/dto/userUpdates';
import { OrganizationsListDto } from '../../../../../../dto/organizations';
import { ServiceErrorType } from '../../../../../../exception/errorHandling';

const app = createTestApplication(apiRouter);

describe('Authenticated organizations test', () => {
    it('should get list of user organizations with params', async () => {
        const {
            tokens: { accessToken },
        } = await signupRandomUser();

        await createOrganizationForUser(accessToken);
        await createOrganizationForUser(accessToken);
        await createOrganizationForUser(accessToken);
        await createOrganizationForUser(accessToken);

        const response1 = await request(app)
            .get('/user/organizations')
            .set('Authorization', accessToken)
            .query({
                p: 0,
                q: 2,
            });
        expect(response1.status).toEqual(200);
        expect(response1.body.payload).toEqual<OrganizationsListDto>({
            page: 0,
            perPage: 2,
            hasMore: true,
            total: 5,
            entries: expect.any(Array),
        });
        expect(response1.body.payload.entries).toHaveLength(2);

        const response2 = await request(app)
            .get('/user/organizations')
            .set('Authorization', accessToken)
            .query({
                scope: OrganizationScope.SHORTENER_SCOPE,
                p: 1,
                q: 2,
            });
        expect(response2.status).toEqual(200);
        expect(response2.body.payload).toEqual<OrganizationsListDto>({
            page: 1,
            perPage: 2,
            hasMore: true,
            total: 5,
            entries: expect.any(Array),
        });
        expect(response2.body.payload.entries).toHaveLength(2);

        const response3 = await request(app)
            .get('/user/organizations')
            .set('Authorization', accessToken)
            .query({
                scope: OrganizationScope.SHORTENER_SCOPE,
                p: 2,
                q: 2,
            });
        expect(response3.status).toEqual(200);
        expect(response3.body.payload).toEqual<OrganizationsListDto>({
            page: 2,
            perPage: 2,
            hasMore: false,
            total: 5,
            entries: expect.any(Array),
        });
        expect(response3.body.payload.entries).toHaveLength(1);

        const response4 = await request(app)
            .get('/user/organizations')
            .set('Authorization', accessToken)
            .query({
                scope: OrganizationScope.SHORTENER_SCOPE,
                p: 0,
                q: 10,
            });
        expect(response4.status).toEqual(200);
        expect(response4.body.payload).toEqual<OrganizationsListDto>({
            page: 0,
            perPage: 10,
            hasMore: false,
            total: 5,
            entries: expect.any(Array),
        });
        expect(response4.body.payload.entries).toHaveLength(5);
    });

    it('should get organization by slug', async () => {
        const {
            tokens: { accessToken: firstToken },
            userId,
        } = await signupRandomUser();

        const {
            tokens: { accessToken: secondToken },
            organization,
        } = await createOrganizationForUser(firstToken);

        const resError = await request(app)
            .get(`/user/organizations/${organization.slug}`)
            .set('Authorization', firstToken);
        expect(resError.status).toEqual(403);
        expect(resError.body).toEqual({
            errors: [
                {
                    errorMessage: `User ${userId} does not have access to organization ${organization.slug}`,
                    errorType: ServiceErrorType.ACCESS_DENIED,
                    errorClass: 'AuthorizationDeniedException',
                },
            ],
        });

        const resOk = await request(app)
            .get(`/user/organizations/${organization.slug}`)
            .set('Authorization', secondToken);
        expect(resOk.status).toEqual(200);
        expect(resOk.body.payload).toEqual(organization);
    });
});
