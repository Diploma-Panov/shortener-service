import { Router, Request } from 'express';
import { logger } from '../../../../../config/logger';
import { parseJwtToken } from '../../../../../auth/jwt';
import {
    InviteMemberDto,
    OrganizationMembersListDto,
} from '../../../../../dto/organizationMembers';
import { AuthServiceClient } from '../../../../../components/api/AuthServiceClient';
import { AbstractResponseDto } from '../../../../../dto/common/AbstractResponseDto';
import { MessageResponseDto } from '../../../../../dto/common/MessageResponseDto';

const authenticatedOrganizationMembersRouter = Router({ mergeParams: true });

authenticatedOrganizationMembersRouter.get(
    '/',
    async (
        req: Request<
            { slug: string },
            AbstractResponseDto<OrganizationMembersListDto>,
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

authenticatedOrganizationMembersRouter.post(
    '/',
    async (
        req: Request<{ slug: string }, AbstractResponseDto<MessageResponseDto>, InviteMemberDto>,
        res,
        next,
    ) => {
        try {
            const { slug } = req.params;
            const dto: InviteMemberDto = req.body;
            const accessToken: string = req.headers.authorization ?? '';
            const { userId } = parseJwtToken(accessToken);
            logger.info(
                `Received POST /api/shrt/v0/user/organizations/${slug}/members by userId=${userId}`,
            );
            const payload: MessageResponseDto = await AuthServiceClient.inviteNewOrganizationMember(
                accessToken,
                slug,
                dto,
            );
            res.json({
                payloadType: 'MessageResponseDto',
                payload,
            });
        } catch (e) {
            next(e);
        }
    },
);

export { authenticatedOrganizationMembersRouter };
