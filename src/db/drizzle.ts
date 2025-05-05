import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../config';

const queryClient = postgres({
    host: config.postgres.host,
    port: config.postgres.port,
    database: config.postgres.database,
    user: config.postgres.username,
    password: config.postgres.password,
    ssl: config.postgres.ssl,

    max: 100,
    idle_timeout: 30_000,
    connect_timeout: 10_000,
});

export const db = drizzle(queryClient);
