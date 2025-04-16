import { createTestApplication, signupRandomUser } from '../../../../../utils/apiUtils';
import request from 'supertest';
import { apiRouter } from '../../../../../../routes/api/shrt/v0';
import { Express } from 'express';
import { UserInfoDto } from '../../../../../../dto/users';

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
});
