import { Router, Request } from 'express';
import { logger } from '../../../../../config/logger';
import { parseJwtToken } from '../../../../../auth/jwt';
import { OrganizationMembersListDto } from '../../../../../dto/organizationMembers';
import { AuthServiceClient } from '../../../../../components/api/AuthServiceClient';

const authenticatedOrganizationMembersRouter = Router({ mergeParams: true });

authenticatedOrganizationMembersRouter.get(
    '/',
    async (
        req: Request<
            { slug: string },
            unknown,
            void,
            { p?: number; q?: number; dir?: string; sb?: string }
        >,
        res,
        next,
    ) => {
        try {
            const { slug } = req.params;
            const query = req.query;
            const accessToken: string = req.headers.authorization ?? '';
            const { userId } = parseJwtToken(accessToken);
            logger.info(
                `Received GET /api/shrt/v0/user/organizations/${slug}/members by userId=${userId}`,
            );
            const payload: OrganizationMembersListDto =
                await AuthServiceClient.getOrganizationMembers(accessToken, slug, query);
            res.json({
                payloadType: 'OrganizationMembersListDto',
                payload,
            });
        } catch (e) {
            next(e);
        }
    },
);

export { authenticatedOrganizationMembersRouter };
