import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

console.log("DRIZZLE_SSL - " + process.env.DRIZZLE_SSL);

export default {
    schema: "./src/db/schema.ts",
    out: "./drizzle/migrations",
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT!),
        user: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_PRIMARY_DATABASE!,
        ssl: process.env.DRIZZLE_SSL === 'true'
    },
} satisfies Config;
