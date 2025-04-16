import { Router } from 'express';
import { logger } from '../../../../../config/logger';
import { parseJwtToken } from '../../../../../auth/jwt';
import { AuthServiceClient } from '../../../../../components/api/AuthServiceClient';
import { OrganizationsListDto } from '../../../../../dto/organizations';
import { OrganizationScope } from '../../../../../kafka/dto/userUpdates';

const authenticatedOrganizationsRouter = Router();

authenticatedOrganizationsRouter.get('/', async (req, res, next) => {
    try {
        const accessToken: string = req.headers.authorization ?? '';
        const { userId } = parseJwtToken(accessToken);
        logger.info(`Received GET /api/shrt/v0/user/organizations for userId=${userId}`);
        const payload: OrganizationsListDto = await AuthServiceClient.getUserOrganizations(
            accessToken,
            { ...req.query, scope: OrganizationScope.SHORTENER_SCOPE },
        );
        res.json({
            payloadType: 'OrganizationsListDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

export { authenticatedOrganizationsRouter };
