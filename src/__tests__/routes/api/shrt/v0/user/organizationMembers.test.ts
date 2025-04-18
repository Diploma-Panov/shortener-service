import {
    createOrganizationForUser,
    createTestApplication,
    inviteMemberInOrganization,
    signupRandomUser,
} from '../../../../../utils/apiUtils';
import request from 'supertest';
import { apiRouter } from '../../../../../../routes/api/shrt/v0';
import { Express } from 'express';
import { OrganizationMembersListDto } from '../../../../../../dto/organizationMembers';

const app: Express = createTestApplication(apiRouter);

describe('Authenticated organization members test', () => {
    it('should get list of organization members', async () => {
        const {
            tokens: { accessToken: oldAccessToken },
        } = await signupRandomUser();

        const {
            organization: { slug },
            tokens: { accessToken },
        } = await createOrganizationForUser(oldAccessToken);

        await inviteMemberInOrganization(slug, accessToken);
        await inviteMemberInOrganization(slug, accessToken);
        await inviteMemberInOrganization(slug, accessToken);
        await inviteMemberInOrganization(slug, accessToken);

        const res1 = await request(app)
            .get(`/user/organizations/${slug}/members`)
            .set('Authorization', accessToken);
        expect(res1.status).toEqual(200);
        expect(res1.body.payload).toEqual<OrganizationMembersListDto>({
            entries: expect.anything(),
            total: 5,
            hasMore: false,
            page: 0,
            perPage: 10,
        });

        const res2 = await request(app)
            .get(`/user/organizations/${slug}/members`)
            .query({ p: 0, q: 2, sb: 'email', dir: 'desc' })
            .set('Authorization', accessToken);
        expect(res2.status).toEqual(200);
        expect(res2.body.payload).toEqual<OrganizationMembersListDto>({
            entries: expect.anything(),
            total: 5,
            hasMore: true,
            page: 0,
            perPage: 2,
        });
        expect(res2.body.payload.entries).toHaveLength(2);

        const res3 = await request(app)
            .get(`/user/organizations/${slug}/members`)
            .query({ p: 2, q: 2, sb: 'email', dir: 'asc' })
            .set('Authorization', accessToken);
        expect(res3.status).toEqual(200);
        expect(res3.body.payload).toEqual<OrganizationMembersListDto>({
            entries: expect.anything(),
            total: 5,
            hasMore: false,
            page: 2,
            perPage: 2,
        });
        expect(res3.body.payload.entries).toHaveLength(1);

        const res4 = await request(app)
            .get(`/user/organizations/${slug}/members`)
            .query({ p: 3, q: 2, sb: 'email', dir: 'desc' })
            .set('Authorization', accessToken);
        expect(res4.status).toEqual(200);
        expect(res4.body.payload).toEqual<OrganizationMembersListDto>({
            entries: expect.anything(),
            total: 5,
            hasMore: false,
            page: 3,
            perPage: 2,
        });
        expect(res4.body.payload.entries).toHaveLength(0);
    });
});
