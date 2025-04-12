import {Router} from "express";
import {AbstractResponseDto} from "../../../../../../dto/common/AbstractResponseDto";
import {HealthResponseDto, HealthStatus} from "../../../../../../dto/platform/health";

const platformRouter = Router();

platformRouter.get('/health', (req, res, next) => {
    res.json({
        payload: {
            status: HealthStatus.UP
        },
        payloadType: 'HealthResponseDto'
    } as AbstractResponseDto<HealthResponseDto>);
});

export { platformRouter };