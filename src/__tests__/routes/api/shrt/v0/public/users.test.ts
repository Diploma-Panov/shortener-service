import {
    createTestApplication,
    signupRandomAdminUser,
    signupRandomUser,
} from '../../../../../utils/apiUtils';
import { publicUsersRouter } from '../../../../../../routes/api/shrt/v0/public/users';
import request from 'supertest';
import { UserLoginDto, UserSignupDto } from '../../../../../../dto/users';
import {
    generateCompliantPassword,
    generateRandomAlphabeticalString,
    generateRandomUrl,
    generateUniqueEmail,
} from '../../../../../utils/dataUtils';
import { TokenResponseDto } from '../../../../../../dto/common/TokenResponseDto';
import { AuthServiceClient } from '../../../../../../components/api/AuthServiceClient';

const app = createTestApplication(publicUsersRouter);

describe('Users public router test', () => {
    it('should sign up new user', async () => {
        const dto: UserSignupDto = {
            username: generateUniqueEmail(),
            password: generateCompliantPassword(),
            firstName: generateRandomAlphabeticalString(20),
            lastName: generateRandomAlphabeticalString(20),
            companyName: generateRandomAlphabeticalString(30),
            registrationScope: 'SHORTENER_SCOPE',
            siteUrl: generateRandomUrl(),
            profilePictureBase64: null,
        };
        const res = await request(app).post('/signup').send(dto);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<TokenResponseDto>({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
        });
    });

    it('should login existing user', async () => {
        const {
            signupData: { username, password },
        } = await signupRandomUser();
        const dto: UserLoginDto = {
            username,
            password,
        };
        const res = await request(app).post('/login').send(dto);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<TokenResponseDto>({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
        });
    });

    it('should exchange short code', async () => {
        const { userId } = await signupRandomUser();
        const {
            tokens: { accessToken },
        } = await signupRandomAdminUser();
        const { shortCode } = await AuthServiceClient.loginAsUserByAdmin(userId, accessToken);
        const res = await request(app).get(`/exchange-short-code/${shortCode}`);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<TokenResponseDto>({
            accessToken: expect.any(String),
            refreshToken: null,
        });
    });
});
