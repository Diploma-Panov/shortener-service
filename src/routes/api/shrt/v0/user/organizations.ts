import { Router } from 'express';
import { logger } from '../../../../../config/logger';
import { parseJwtToken } from '../../../../../auth/jwt';
import { AuthServiceClient } from '../../../../../components/api/AuthServiceClient';
import {
    CreateOrganizationDto,
    OrganizationDto,
    OrganizationsListDto,
    UpdateOrganizationAvatarDto,
    UpdateOrganizationInfoDto,
} from '../../../../../dto/organizations';
import { OrganizationScope } from '../../../../../kafka/dto/userUpdates';
import { TokenResponseDto } from '../../../../../dto/common/TokenResponseDto';
import { updateOrCreateOrganization } from '../../../../../components/dao/organizationDao';

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

authenticatedOrganizationsRouter.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const accessToken: string = req.headers.authorization ?? '';
        const { userId } = parseJwtToken(accessToken);
        logger.info(`Received GET /api/shrt/v0/user/organizations/${slug} by userId=${userId}`);
        const payload: OrganizationDto = await AuthServiceClient.getUserOrganizationBySlug(
            accessToken,
            slug,
        );
        res.json({
            payloadType: 'OrganizationDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

authenticatedOrganizationsRouter.post('/', async (req, res, next) => {
    try {
        const dto: CreateOrganizationDto = req.body;
        const accessToken: string = req.headers.authorization ?? '';
        const { userId } = parseJwtToken(accessToken);
        logger.info(
            `Received POST /api/shrt/v0/user/organizations by userId=${userId} with dto=${JSON.stringify(
                dto,
            )}`,
        );

        const payload: TokenResponseDto = await AuthServiceClient.createNewOrganization(
            accessToken,
            dto,
        );

        const newOrganization: OrganizationDto = await AuthServiceClient.getUserOrganizationBySlug(
            payload.accessToken,
            dto.slug,
        );
        await updateOrCreateOrganization({
            slug: newOrganization.slug,
            id: newOrganization.id,
            name: newOrganization.name,
            creatorUserId: BigInt(userId),
            siteUrl: newOrganization.url,
            description: newOrganization.description,
        });

        res.json({
            payloadType: 'TokenResponseDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

authenticatedOrganizationsRouter.patch('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const dto: UpdateOrganizationInfoDto = req.body;
        const accessToken: string = req.headers.authorization ?? '';
        const { userId } = parseJwtToken(accessToken);
        logger.info(
            `Received PATCH /api/shrt/v0/user/organizations/${slug} by userId=${userId} with dto=${JSON.stringify(
                dto,
            )}`,
        );

        const payload: OrganizationDto = await AuthServiceClient.updateOrganizationInfo(
            accessToken,
            slug,
            dto,
        );
        await updateOrCreateOrganization({
            slug: payload.slug,
            id: payload.id,
            name: payload.name,
            creatorUserId: BigInt(userId),
            siteUrl: payload.url,
            description: payload.description,
        });

        res.json({
            payloadType: 'OrganizationDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

authenticatedOrganizationsRouter.put('/:slug/avatar', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const dto: UpdateOrganizationAvatarDto = req.body;
        const accessToken: string = req.headers.authorization ?? '';
        const { userId } = parseJwtToken(accessToken);
        logger.info(
            `Received PUT /api/shrt/v0/user/organizations/${slug}/avatar by userId=${userId}`,
        );

        const payload: OrganizationDto = await AuthServiceClient.updateOrganizationAvatar(
            accessToken,
            slug,
            dto,
        );

        res.json({
            payloadType: 'OrganizationDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

authenticatedOrganizationsRouter.delete('/:slug/avatar', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const accessToken: string = req.headers.authorization ?? '';
        const { userId } = parseJwtToken(accessToken);
        logger.info(
            `Received DELETE /api/shrt/v0/user/organizations/${slug}/avatar by userId=${userId}`,
        );

        const payload: OrganizationDto = await AuthServiceClient.deleteOrganizationAvatar(
            accessToken,
            slug,
        );

        res.json({
            payloadType: 'OrganizationDto',
            payload,
        });
    } catch (e) {
        next(e);
    }
});

export { authenticatedOrganizationsRouter };
