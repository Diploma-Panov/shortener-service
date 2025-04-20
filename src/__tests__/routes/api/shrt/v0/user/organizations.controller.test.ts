import {
    createOrganizationForUser,
    createTestApplication,
    signupRandomUser,
} from '../../../../../utils/apiUtils';
import { apiRouter } from '../../../../../../routes/api/shrt/v0';
import request from 'supertest';
import { OrganizationScope } from '../../../../../../kafka/dto/userUpdates.views';
import {
    CreateOrganizationDto,
    OrganizationDto,
    OrganizationsListDto,
    OrganizationType,
    UpdateOrganizationAvatarDto,
    UpdateOrganizationInfoDto,
} from '../../../../../../dto/organizations.views';
import { ServiceErrorType } from '../../../../../../exception/errorHandling';
import {
    generateRandomAlphabeticalString,
    generateRandomAlphanumericalString,
    generateRandomUrl,
    generateUniqueSlug,
} from '../../../../../utils/dataUtils';
import { TokenResponseDto } from '../../../../../../dto/common/TokenResponseDto';
import { ErrorResponseDto } from '../../../../../../dto/common/errors';
import { AuthServiceClient } from '../../../../../../components/api/AuthServiceClient';

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

    it('should create new organization by user', async () => {
        const {
            tokens: { accessToken: firstToken },
        } = await signupRandomUser();

        const dto: CreateOrganizationDto = {
            avatarBase64: null,
            description: generateRandomAlphabeticalString(20),
            name: generateRandomAlphabeticalString(20),
            scope: 'SHORTENER_SCOPE',
            slug: generateUniqueSlug(),
            url: generateRandomUrl(),
        };
        const resCreate = await request(app)
            .post('/user/organizations')
            .set('Authorization', firstToken)
            .send(dto);
        expect(resCreate.status).toEqual(200);
        expect(resCreate.body.payload).toEqual<TokenResponseDto>({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
        });

        const newToken: string = resCreate.body.payload.accessToken;
        const resInfo = await request(app)
            .get(`/user/organizations/${dto.slug}`)
            .set('Authorization', newToken);
        expect(resInfo.status).toEqual(200);
        expect(resInfo.body.payload).toEqual<OrganizationDto>({
            id: expect.any(Number),
            name: dto.name,
            slug: dto.slug,
            scope: 'SHORTENER_SCOPE',
            url: dto.url,
            description: dto.description,
            avatarUrl: null,
            type: OrganizationType.MANUAL,
            membersCount: 1,
        });
    });

    it('should return error if creation dto is invalid', async () => {
        const {
            tokens: { accessToken },
        } = await signupRandomUser();

        const dto = {
            avatarBase64: null,
            description: null,
            name: null,
            scope: 'SHORTENER_SCOPE',
            slug: null,
            url: null,
        };
        const resCreate = await request(app)
            .post('/user/organizations')
            .set('Authorization', accessToken)
            .send(dto);
        expect(resCreate.status).toEqual(400);
        expect(resCreate.body).toEqual<ErrorResponseDto>({
            errors: [
                {
                    errorMessage: expect.any(String),
                    errorType: ServiceErrorType.FORM_VALIDATION_FAILED,
                    errorClass: 'MethodArgumentNotValidException',
                },
            ],
        });
    });

    it('should update organization info', async () => {
        const {
            tokens: { accessToken },
        } = await signupRandomUser();

        const organizations: OrganizationsListDto = await AuthServiceClient.getUserOrganizations(
            accessToken,
            { scope: OrganizationScope.SHORTENER_SCOPE },
        );
        const o: OrganizationDto = organizations.entries[0];

        const dto: UpdateOrganizationInfoDto = {
            newName: generateRandomAlphabeticalString(20),
            newDescription: generateRandomAlphabeticalString(40),
            newUrl: generateRandomUrl(),
        };
        const resUpdate = await request(app)
            .patch(`/user/organizations/${o.slug}`)
            .set('Authorization', accessToken)
            .send(dto);
        expect(resUpdate.status).toEqual(200);
        expect(resUpdate.body.payload).toEqual<OrganizationDto>({
            ...o,
            name: dto.newName!,
            description: dto.newDescription!,
            url: dto.newUrl!,
        });
    });

    it('should update organization avatar', async () => {
        const {
            tokens: { accessToken },
        } = await signupRandomUser();

        const organizations: OrganizationsListDto = await AuthServiceClient.getUserOrganizations(
            accessToken,
            { scope: OrganizationScope.SHORTENER_SCOPE },
        );
        const o: OrganizationDto = organizations.entries[0];

        const dto1: UpdateOrganizationAvatarDto = {
            newAvatarBase64: generateRandomAlphanumericalString(100),
        };
        const updateRes1 = await request(app)
            .put(`/user/organizations/${o.slug}/avatar`)
            .set('Authorization', accessToken)
            .send(dto1);
        expect(updateRes1.status).toEqual(200);
        expect(updateRes1.body.payload).toMatchObject<Partial<OrganizationDto>>({
            avatarUrl: expect.any(String),
        });

        const dto2: UpdateOrganizationAvatarDto = {
            newAvatarBase64: generateRandomAlphanumericalString(100),
        };
        const updateRes2 = await request(app)
            .put(`/user/organizations/${o.slug}/avatar`)
            .set('Authorization', accessToken)
            .send(dto2);
        expect(updateRes2.status).toEqual(200);
        expect(updateRes2.body.payload).toMatchObject<Partial<OrganizationDto>>({
            avatarUrl: expect.any(String),
        });

        expect(updateRes1.body.payload.avatarUrl).not.toEqual(updateRes2.body.payload.avatarUrl);
    });

    it('should delete organization avatar', async () => {
        const {
            tokens: { accessToken },
        } = await signupRandomUser();

        const organizations: OrganizationsListDto = await AuthServiceClient.getUserOrganizations(
            accessToken,
            { scope: OrganizationScope.SHORTENER_SCOPE },
        );
        const o: OrganizationDto = organizations.entries[0];

        const dto: UpdateOrganizationAvatarDto = {
            newAvatarBase64: generateRandomAlphanumericalString(100),
        };
        const updateRes = await request(app)
            .put(`/user/organizations/${o.slug}/avatar`)
            .set('Authorization', accessToken)
            .send(dto);
        expect(updateRes.status).toEqual(200);
        expect(updateRes.body.payload).toMatchObject<Partial<OrganizationDto>>({
            avatarUrl: expect.any(String),
        });

        const infoRes1 = await request(app)
            .get(`/user/organizations/${o.slug}`)
            .set('Authorization', accessToken);
        expect(infoRes1.status).toEqual(200);
        expect(infoRes1.body.payload).toMatchObject<Partial<OrganizationDto>>({
            avatarUrl: updateRes.body.payload.avatarUrl,
        });

        const deleteRes = await request(app)
            .delete(`/user/organizations/${o.slug}/avatar`)
            .set('Authorization', accessToken);
        expect(deleteRes.status).toEqual(200);
        expect(deleteRes.body.payload).toMatchObject<Partial<OrganizationDto>>({
            avatarUrl: null,
        });

        const infoRes2 = await request(app)
            .get(`/user/organizations/${o.slug}`)
            .set('Authorization', accessToken);
        expect(infoRes2.status).toEqual(200);
        expect(infoRes2.body.payload).toMatchObject<Partial<OrganizationDto>>({
            avatarUrl: null,
        });
    });

    it('should delete organization', async () => {
        const {
            tokens: { accessToken },
        } = await signupRandomUser();

        const organizations: OrganizationsListDto = await AuthServiceClient.getUserOrganizations(
            accessToken,
            { scope: OrganizationScope.SHORTENER_SCOPE },
        );
        const o: OrganizationDto = organizations.entries[0];

        const deletePermanentRes = await request(app)
            .delete(`/user/organizations/${o.slug}`)
            .set('Authorization', accessToken);
        expect(deletePermanentRes.status).toEqual(403);
        expect(deletePermanentRes.body).toEqual({
            errors: [
                {
                    errorMessage: `Cannot remove a permanent organization ${o.slug}`,
                    errorType: ServiceErrorType.ORGANIZATION_ACTION_NOT_ALLOWED,
                    errorClass: 'OrganizationActionNotAllowed',
                },
            ],
        });

        const {
            organization: { slug: manualOrgSlug },
            tokens: { accessToken: newToken },
        } = await createOrganizationForUser(accessToken);
        const organizationsBeforeRemoval: OrganizationsListDto =
            await AuthServiceClient.getUserOrganizations(newToken, {
                scope: OrganizationScope.SHORTENER_SCOPE,
            });
        expect(organizationsBeforeRemoval.entries).toHaveLength(2);

        const deleteManualRes = await request(app)
            .delete(`/user/organizations/${manualOrgSlug}`)
            .set('Authorization', newToken);
        expect(deleteManualRes.status).toEqual(200);
        expect(deleteManualRes.body.payload).toEqual<TokenResponseDto>({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
        });

        const organizationsAfterRemoval: OrganizationsListDto =
            await AuthServiceClient.getUserOrganizations(newToken, {
                scope: OrganizationScope.SHORTENER_SCOPE,
            });
        expect(organizationsAfterRemoval.entries).toHaveLength(1);
    });
});
