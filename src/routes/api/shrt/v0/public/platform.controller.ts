import { Router } from 'express';
import { AbstractResponseDto } from '../../../../../dto/common/AbstractResponseDto';
import { HealthResponseDto, HealthStatus } from '../../../../../dto/platform.views';
import { logger } from '../../../../../config/logger';

const platformRouter = Router();

platformRouter.get('/health', (req, res) => {
    logger.info(`Received GET /api/shrt/v0/public/platform/health from IP=${req.ip}`);
    res.json({
        payload: {
            status: HealthStatus.UP,
        },
        payloadType: 'HealthResponseDto',
    } as AbstractResponseDto<HealthResponseDto>);
});

export { platformRouter };
