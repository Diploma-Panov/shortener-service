import dotenv from 'dotenv';
import { Dialect } from 'drizzle-orm';

dotenv.config();

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
    },
    postgres: {
        host: getEnv('DB_HOST'),
        port: parseInt(getEnv('DB_PORT', '5432')),
        database: getEnv('DB_PRIMARY_DATABASE'),
        username: getEnv('DB_USERNAME'),
        password: getEnv('DB_PASSWORD'),
        dialect: getEnv('DB_DIALECT') as Dialect,
    },
    dynamodb: {
        region: getEnv('AWS_REGION'),
        tableName: getEnv('DDB_LINK_RESOLUTIONS_TABLE'),
    },
    kafka: {
        bootstrapServer: getEnv('KAFKA_BOOTSTRAP_SERVER'),
        userUpdatesTopicName: getEnv('KAFKA_USER_UPDATES_TOPIC_NAME'),
    },
    jwt: {
        publicKey: getEnv('JWT_PUBLIC_KEY').replace(/\\n/g, '\n'),
    },
    api: {
        authServiceBaseUrl: getEnv('AUTH_SERVICE_BASE_URL'),
    },
};
