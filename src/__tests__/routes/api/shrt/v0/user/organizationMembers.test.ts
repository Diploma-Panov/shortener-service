import {
    createOrganizationForUser,
    createTestApplication,
    inviteMemberInOrganization,
    signupRandomUser,
} from '../../../../../utils/apiUtils';
import request from 'supertest';
import { apiRouter } from '../../../../../../routes/api/shrt/v0';
import { Express } from 'express';
import {
    InviteMemberDto,
    OrganizationMemberDto,
    OrganizationMembersListDto,
    UpdateMemberRolesDto,
    UpdateMemberUrlsDto,
} from '../../../../../../dto/organizationMembers';
import {
    generateRandomAlphabeticalString,
    generateRandomAlphanumericalString,
    generateUniqueEmail,
} from '../../../../../utils/dataUtils';
import { MemberRole } from '../../../../../../auth/common';
import { AuthServiceClient } from '../../../../../../components/api/AuthServiceClient';
import { MessageResponseDto } from '../../../../../../dto/common/MessageResponseDto';
import { OrganizationMember } from '../../../../../../db/model';

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

    it('should invite new member into the organization', async () => {
        const {
            tokens: { accessToken: oldToken },
        } = await signupRandomUser();

        const {
            tokens: { accessToken },
            organization: { slug },
        } = await createOrganizationForUser(oldToken);

        const dto: InviteMemberDto = {
            allowedAllUrls: false,
            allowedUrls: [1, 2, 3],
            email: generateUniqueEmail(),
            firstname: generateRandomAlphabeticalString(20),
            lastname: generateRandomAlphanumericalString(20),
            roles: [
                MemberRole.ORGANIZATION_MEMBER,
                MemberRole.ORGANIZATION_URLS_MANAGER,
                MemberRole.ORGANIZATION_MEMBERS_MANAGER,
            ],
        };
        const resInvited = await request(app)
            .post(`/user/organizations/${slug}/members`)
            .set('Authorization', accessToken)
            .send(dto);
        expect(resInvited.status).toEqual(200);
        expect(resInvited.body.payload).toEqual({
            message: 'SUCCESS',
        });

        const resMembers = await request(app)
            .get(`/user/organizations/${slug}/members`)
            .set('Authorization', accessToken);
        expect(resMembers.status).toEqual(200);
        expect(resMembers.body.payload).toEqual<OrganizationMembersListDto>({
            entries: expect.arrayContaining<OrganizationMemberDto>([
                {
                    id: expect.any(Number),
                    fullName: dto.firstname + ' ' + dto.lastname,
                    email: dto.email,
                    roles: expect.arrayContaining(dto.roles),
                    allowedUrls: expect.arrayContaining(dto.allowedUrls),
                    allowedAllUrls: dto.allowedAllUrls,
                },
            ]),
            total: 2,
            hasMore: false,
            page: 0,
            perPage: 10,
        });
    });

    it('should update member roles', async () => {
        const {
            tokens: { accessToken: oldToken },
        } = await signupRandomUser();

        const {
            tokens: { accessToken },
            organization: { slug },
        } = await createOrganizationForUser(oldToken);

        const {
            member: { firstname, lastname, email, allowedAllUrls, allowedUrls },
            model: { id },
        } = await inviteMemberInOrganization(slug, accessToken); // Invited with ORGANIZATION_MEMBER role only

        const dto: UpdateMemberRolesDto = {
            newRoles: [
                MemberRole.ORGANIZATION_MEMBER,
                MemberRole.ORGANIZATION_URLS_MANAGER,
                MemberRole.ORGANIZATION_MEMBERS_MANAGER,
            ],
        };
        const res = await request(app)
            .put(`/user/organizations/${slug}/members/${id}/roles`)
            .set('Authorization', accessToken)
            .send(dto);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual({
            message: 'SUCCESS',
        });

        const members = await AuthServiceClient.getOrganizationMembers(accessToken, slug, {});

        expect(members).toEqual<OrganizationMembersListDto>({
            entries: expect.arrayContaining<OrganizationMemberDto>([
                {
                    id,
                    fullName: firstname + ' ' + lastname,
                    email: email,
                    roles: expect.arrayContaining(dto.newRoles),
                    allowedUrls: expect.arrayContaining(allowedUrls),
                    allowedAllUrls: allowedAllUrls,
                },
            ]),
            total: 2,
            hasMore: false,
            page: 0,
            perPage: 10,
        });
    });

    it('should update member allowed urls', async () => {
        const {
            tokens: { accessToken: oldToken },
        } = await signupRandomUser();

        const {
            tokens: { accessToken },
            organization: { slug },
        } = await createOrganizationForUser(oldToken);

        const {
            model: {
                id,
                email,
                fullName,
                roles,
                allowedAllUrls: allowedAllUrlsBefore,
                allowedUrls: allowedUrlsBefore,
            },
        } = await inviteMemberInOrganization(slug, accessToken);

        const allMembersBefore: OrganizationMembersListDto =
            await AuthServiceClient.getOrganizationMembers(accessToken, slug, {});
        expect(allMembersBefore.entries).toContainEqual<OrganizationMemberDto>({
            id,
            fullName,
            email,
            roles,
            allowedUrls: allowedUrlsBefore,
            allowedAllUrls: allowedAllUrlsBefore,
        });

        const dto: UpdateMemberUrlsDto = {
            allowedAllUrls: false,
            newUrlsIds: [66, 77, 99],
        };
        const res = await request(app)
            .put(`/user/organizations/${slug}/members/${id}/urls`)
            .set('Authorization', accessToken)
            .send(dto);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<MessageResponseDto>({
            message: 'SUCCESS',
        });

        const allMembersAfter: OrganizationMembersListDto =
            await AuthServiceClient.getOrganizationMembers(accessToken, slug, {});
        expect(allMembersAfter.entries).toContainEqual<OrganizationMemberDto>({
            id,
            fullName,
            email,
            roles,
            allowedUrls: dto.newUrlsIds,
            allowedAllUrls: dto.allowedAllUrls,
        });
    });

    it('should delete organization member', async () => {
        const {
            tokens: { accessToken: oldToken },
        } = await signupRandomUser();

        const {
            tokens: { accessToken },
            organization: { slug },
        } = await createOrganizationForUser(oldToken);

        const {
            model: { id },
        } = await inviteMemberInOrganization(slug, accessToken);

        const { total: membersBefore } = await AuthServiceClient.getOrganizationMembers(
            accessToken,
            slug,
            {},
        );
        expect(membersBefore).toEqual(2);

        const res = await request(app)
            .delete(`/user/organizations/${slug}/members/${id}`)
            .set('Authorization', accessToken);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<MessageResponseDto>({
            message: 'SUCCESS',
        });

        const { total: membersAfter } = await AuthServiceClient.getOrganizationMembers(
            accessToken,
            slug,
            {},
        );
        expect(membersAfter).toEqual(1);
    });
});
