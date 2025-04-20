import { signupRandomUser } from '../../../../../utils/apiUtils';

describe('Short URLs controller test', () => {
    it('should return list of short urls of organization with query params', async () => {
        const {
            tokens: { accessToken },
            organization: { slug },
        } = await signupRandomUser();
    });
});
