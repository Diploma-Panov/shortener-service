import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { Dialect } from 'drizzle-orm';

const rawEnv = dotenv.config();
dotenvExpand.expand(rawEnv);

const getEnv = (key: string, fallback?: string): string => {
    const value = process.env[key] || fallback;
    if (!value) throw new Error(`Missing env var: ${key}`);
    return value;
};

export const config = {
    app: {
        port: parseInt(getEnv('SERVER_PORT', '3000')),
        logLevel: getEnv('LOG_LEVEL', 'INFO'),
        adminUsername: getEnv('ADMIN_USERNAME'),
        adminPassword: getEnv('ADMIN_PASSWORD'),
        systemToken: getEnv('SYSTEM_TOKEN'),
    },
    postgres: {
        host: getEnv('DB_HOST'),
        port: parseInt(getEnv('DB_PORT', '5432')),
        database: getEnv('DB_PRIMARY_DATABASE'),
        username: getEnv('DB_USERNAME'),
        password: getEnv('DB_PASSWORD'),
        dialect: getEnv('DB_DIALECT') as Dialect,
        drizzleSsl: getEnv('DRIZZLE_SSL', 'false') === 'true',
    },
    dynamodb: {
        region: getEnv('AWS_REGION'),
        tableName: getEnv('STATS_TABLE_NAME'),
    },
    kafka: {
        bootstrapServers: (process.env.KAFKA_BOOTSTRAP_SERVER || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        userUpdatesTopicName: process.env.KAFKA_USER_UPDATES_TOPIC_NAME!,
    },
    jwt: {
        publicKey: getEnv('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
    },
    api: {
        authServiceBaseUrl: getEnv('AUTH_SERVICE_BASE_URL'),
    },
    urls: {
        baseUrl: getEnv('SHORT_URL_BASE'),
    },
    redis: {
        url: getEnv('REDIS_URL'),
    },
};
