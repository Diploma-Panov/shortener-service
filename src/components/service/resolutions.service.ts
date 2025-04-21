import { ddb } from '../../dynamo/client';
import geoip from 'geoip-lite';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { config } from '../../config';
import { logger } from '../../config/logger';

export const recordResolution = async (code: string, ip: string): Promise<void> => {
    logger.info(`Recording hit of url ${config.urls.baseUrl}/${code} from ip=${ip}`);
    const geo = geoip.lookup(ip);
    const country = geo?.country || 'XX';
    const city = geo?.city ? `${country}#${geo.city}` : undefined;

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const hour = now.toISOString().slice(0, 13);
    const month = now.toISOString().slice(0, 7);

    const updates = [
        { sk: `DATE#${date}` },
        { sk: `HOUR#${hour}` },
        { sk: `MONTH#${month}` },
        { sk: `COUNTRY#${country}` },
        ...(city ? [{ sk: `CITY#${city}` }] : []),
    ];

    await Promise.all(
        updates.map(({ sk }) =>
            ddb.send(
                new UpdateCommand({
                    TableName: config.dynamodb.tableName,
                    Key: {
                        urlCode: code,
                        bucket: sk,
                    },
                    UpdateExpression: 'ADD #c :inc',
                    ExpressionAttributeNames: { '#c': 'count' },
                    ExpressionAttributeValues: { ':inc': 1 },
                }),
            ),
        ),
    );
};
