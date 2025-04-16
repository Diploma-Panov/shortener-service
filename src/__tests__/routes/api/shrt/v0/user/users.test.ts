import { createTestApplication, signupRandomUser } from '../../../../../utils/apiUtils';
import request from 'supertest';
import { apiRouter } from '../../../../../../routes/api/shrt/v0';
import { Express } from 'express';
import { UpdateUserInfoDto, UserInfoDto } from '../../../../../../dto/users';
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
});
