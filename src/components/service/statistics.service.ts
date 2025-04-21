import { ddb } from '../../dynamo/client';
import { config } from '../../config';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { GlobalStatisticsDto, PeriodCountsDto } from '../../dto/statistics.views';

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

export const aggregatePeriodStatsByCode = async (p: {
    code: string;
    startKey: string;
    endKey: string;
    prefix: string;
    startDate: Date;
    endDate: Date;
    periodSec: number;
    sliceLen: number;
}): Promise<PeriodCountsDto> => {
    const { Items } = await ddb.send(
        new QueryCommand({
            TableName: config.dynamodb.tableName,
            KeyConditionExpression: 'urlCode = :code AND #bkt BETWEEN :start AND :end',
            ExpressionAttributeNames: {
                '#bkt': 'bucket',
                '#cnt': 'count',
            },
            ExpressionAttributeValues: {
                ':code': p.code,
                ':start': p.startKey,
                ':end': p.endKey,
            },
            ProjectionExpression: '#bkt, #cnt',
            ScanIndexForward: true,
        }),
    );

    const raw: Record<string, number> = {};
    for (const item of Items ?? []) {
        const b = (item.bucket as string).slice(p.prefix.length);
        raw[b] = (raw[b] || 0) + Number(item.count);
    }

    const points: PeriodCountsDto = { counts: [] };
    for (let ts = p.startDate.getTime(); ts <= p.endDate.getTime(); ts += p.periodSec * 1000) {
        const iso = new Date(ts).toISOString().slice(0, p.sliceLen);
        points.counts.push({
            timestamp: iso,
            count: raw[iso] || 0,
        });
    }

    return points;
};
