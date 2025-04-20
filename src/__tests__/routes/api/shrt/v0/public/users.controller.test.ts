import {
    createTestApplication,
    signupRandomAdminUser,
    signupRandomUser,
} from '../../../../../utils/apiUtils';
import request from 'supertest';
import { UserLoginDto, UserSignupDto } from '../../../../../../dto/users.views';
import {
    generateCompliantPassword,
    generateRandomAlphabeticalString,
    generateRandomUrl,
    generateUniqueEmail,
} from '../../../../../utils/dataUtils';
import { TokenResponseDto } from '../../../../../../dto/common/TokenResponseDto';
import { AuthServiceClient } from '../../../../../../components/api/AuthServiceClient';
import { ServiceErrorType } from '../../../../../../exception/errorHandling';
import { ErrorResponseDto } from '../../../../../../dto/common/errors';
import { apiRouter } from '../../../../../../routes/api/shrt/v0';

const app = createTestApplication(apiRouter);

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
        const res = await request(app).post('/public/users/signup').send(dto);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<TokenResponseDto>({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
        });
    });

    it('should not signup with non-compliant password', async () => {
        const dto: UserSignupDto = {
            username: generateUniqueEmail(),
            password: 'password',
            firstName: generateRandomAlphabeticalString(20),
            lastName: generateRandomAlphabeticalString(20),
            companyName: generateRandomAlphabeticalString(30),
            registrationScope: 'SHORTENER_SCOPE',
            siteUrl: generateRandomUrl(),
            profilePictureBase64: null,
        };
        const res = await request(app).post('/public/users/signup').send(dto);
        expect(res.status).toEqual(400);
        expect(res.body).toEqual<ErrorResponseDto>({
            errors: [
                {
                    errorMessage: 'Password password is not compliant',
                    errorType: ServiceErrorType.PASSWORD_IS_NOT_COMPLIANT,
                    errorClass: 'UserSignupException',
                },
            ],
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
        const res = await request(app).post('/public/users/login').send(dto);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<TokenResponseDto>({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
        });
    });

    it('should not login if user does not exist', async () => {
        const res = await request(app).post('/public/users/login').send({
            username: generateUniqueEmail(),
            password: generateCompliantPassword(),
        });
        expect(res.status).toEqual(401);
        expect(res.body).toEqual<ErrorResponseDto>({
            errors: [
                {
                    errorMessage: 'Login error occurred',
                    errorType: ServiceErrorType.LOGIN_FAILED,
                    errorClass: 'LoginException',
                },
            ],
        });
    });

    it('should not login with wrong password', async () => {
        const {
            signupData: { username },
        } = await signupRandomUser();
        const dto: UserLoginDto = {
            username,
            password: generateCompliantPassword(),
        };
        const res = await request(app).post('/public/users/login').send(dto);
        expect(res.status).toEqual(401);
        expect(res.body).toEqual<ErrorResponseDto>({
            errors: [
                {
                    errorMessage: 'Login error occurred',
                    errorType: ServiceErrorType.LOGIN_FAILED,
                    errorClass: 'LoginException',
                },
            ],
        });
    });

    it('should exchange short code', async () => {
        const { userId } = await signupRandomUser();
        const {
            tokens: { accessToken },
        } = await signupRandomAdminUser();
        const { shortCode } = await AuthServiceClient.loginAsUserByAdmin(userId, accessToken);
        const res = await request(app).get(`/public/users/exchange-short-code/${shortCode}`);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<TokenResponseDto>({
            accessToken: expect.any(String),
            refreshToken: null,
        });
    });

    it('should refresh user tokens', async () => {
        const {
            tokens: { refreshToken },
        } = await signupRandomUser();
        const res = await request(app)
            .get(`/public/users/refresh-token`)
            .set('Authorization', refreshToken!);
        expect(res.status).toEqual(200);
        expect(res.body.payload).toEqual<TokenResponseDto>({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
        });
    });
});
