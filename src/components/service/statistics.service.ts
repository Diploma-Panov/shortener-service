import { ddb } from '../../dynamo/client';
import { config } from '../../config';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { GlobalStatisticsDto } from '../../dto/statistics.views';

export const aggregateGlobalStatsForShortUrlCode = async (
    code: string,
): Promise<GlobalStatisticsDto> => {
    const { Items } = await ddb.send(
        new QueryCommand({
            TableName: config.dynamodb.tableName,
            KeyConditionExpression: 'urlCode = :code',
            ExpressionAttributeValues: { ':code': code },
            ProjectionExpression: '#bkt, #c',
            ExpressionAttributeNames: {
                '#bkt': 'bucket',
                '#c': 'count',
            },
        }),
    );

    const geoItems = (Items ?? []).filter(
        (item) => item.bucket.startsWith('COUNTRY#') || item.bucket.startsWith('CITY#'),
    );

    const countryCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};

    for (const item of geoItems ?? []) {
        const bucket = item.bucket as string;
        const cnt = typeof item.count === 'number' ? item.count : Number(item.count);

        if (bucket.startsWith('COUNTRY#')) {
            const country = bucket.slice('COUNTRY#'.length);
            countryCounts[country] = (countryCounts[country] || 0) + cnt;
        } else if (bucket.startsWith('CITY#')) {
            const parts = bucket.split('#');
            const city = parts.slice(2).join('#');
            cityCounts[city] = (cityCounts[city] || 0) + cnt;
        }
    }

    return { countryCounts, cityCounts };
};
