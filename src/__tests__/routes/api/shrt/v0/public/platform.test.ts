import express from 'express';
import request from 'supertest';
import { HealthResponseDto, HealthStatus } from '../../../../../../dto/platform/health';
import { platformRouter } from '../../../../../../routes/api/shrt/v0/public/platform';
import { createTestApplication } from '../../../../../utils/apiUtils';

const app: express.Express = createTestApplication(platformRouter);

describe('Proxy to running app', () => {
    it('should get response from real running app', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toEqual(200);
        expect(response.body.payloadType).toEqual('HealthResponseDto');
        expect(response.body.payload).toEqual<HealthResponseDto>({
            status: HealthStatus.UP,
        });
    });
});
