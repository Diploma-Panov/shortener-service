import { createTestApplication, signupRandomUser } from '../../../../../utils/apiUtils';
import request from 'supertest';
import { apiRouter } from '../../../../../../routes/api/shrt/v0';
import { Express } from 'express';
import {
    UpdateUserInfoDto,
    UpdateUserProfilePictureDto,
    UserInfoDto,
} from '../../../../../../dto/users';
import {
    generateRandomAlphabeticalString,
    generateRandomAlphanumericalString,
    generateUniqueEmail,
} from '../../../../../utils/dataUtils';

const app: Express = createTestApplication(apiRouter);

describe('Users authenticated controller test', () => {
    it('should get user info', async () => {
        const {
            tokens: { accessToken },
            userId,
            signupData: { firstName, lastName, companyName, username },
        } = await signupRandomUser();

        const res = await request(app).get(`/user/users/info`).set('Authorization', accessToken);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<UserInfoDto>({
            id: userId,
            firstname: firstName,
            lastname: lastName,
            companyName,
            email: username,
            profilePictureUrl: null,
        });
    });

    it('should update user info', async () => {
        const {
            tokens: { accessToken },
            userId,
        } = await signupRandomUser();

        const updateDto: UpdateUserInfoDto = {
            newCompanyName: generateRandomAlphabeticalString(20),
            newEmail: generateUniqueEmail(),
            newFirstname: generateRandomAlphanumericalString(20),
            newLastname: generateRandomAlphabeticalString(20),
        };
        const updateRes = await request(app)
            .patch(`/user/users/info`)
            .set('Authorization', accessToken)
            .send(updateDto);
        expect(updateRes.status).toEqual(200);
        expect(updateRes.body.payload).toEqual<UserInfoDto>({
            id: userId,
            firstname: updateDto.newFirstname!,
            lastname: updateDto.newLastname,
            companyName: updateDto.newCompanyName,
            email: updateDto.newEmail!,
            profilePictureUrl: null,
        });

        const dataAfterRes = await request(app)
            .get(`/user/users/info`)
            .set('Authorization', accessToken);
        expect(dataAfterRes.status).toEqual(200);
        expect(dataAfterRes.body.payload).toEqual<UserInfoDto>({
            id: userId,
            firstname: updateDto.newFirstname!,
            lastname: updateDto.newLastname,
            companyName: updateDto.newCompanyName,
            email: updateDto.newEmail!,
            profilePictureUrl: null,
        });
    });

    it('should upload user profile picture', async () => {
        const {
            tokens: { accessToken },
        } = await signupRandomUser();

        const dto: UpdateUserProfilePictureDto = {
            newProfilePictureBase64: generateRandomAlphabeticalString(20),
        };

        const resUpdate = await request(app)
            .put(`/user/users/picture`)
            .set('Authorization', accessToken)
            .send(dto);
        expect(resUpdate.status).toEqual(200);
        expect(resUpdate.body.payload).toMatchObject<Partial<UserInfoDto>>({
            profilePictureUrl: expect.any(String),
        });

        const resInfo = await request(app)
            .get(`/user/users/info`)
            .set('Authorization', accessToken);
        expect(resInfo.status).toEqual(200);
        expect(resInfo.body.payload).toMatchObject<Partial<UserInfoDto>>({
            profilePictureUrl: resUpdate.body.payload.profilePictureUrl,
        });
    });

    it('should remove profile picture of user', async () => {
        const {
            tokens: { accessToken },
        } = await signupRandomUser();

        const dto: UpdateUserProfilePictureDto = {
            newProfilePictureBase64: generateRandomAlphabeticalString(20),
        };

        const resUpdate = await request(app)
            .put(`/user/users/picture`)
            .set('Authorization', accessToken)
            .send(dto);
        expect(resUpdate.status).toEqual(200);
        expect(resUpdate.body.payload).toMatchObject<Partial<UserInfoDto>>({
            profilePictureUrl: expect.any(String),
        });

        const resRemove = await request(app)
            .delete(`/user/users/picture`)
            .set('Authorization', accessToken);
        expect(resRemove.status).toEqual(200);
        expect(resRemove.body.payload).toMatchObject<Partial<UserInfoDto>>({
            profilePictureUrl: null,
        });

        const resInfo = await request(app)
            .get(`/user/users/info`)
            .set('Authorization', accessToken);
        expect(resInfo.status).toEqual(200);
        expect(resInfo.body.payload).toMatchObject<Partial<UserInfoDto>>({
            profilePictureUrl: null,
        });
    });
});
