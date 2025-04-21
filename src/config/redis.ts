import { createClient } from 'redis';
import { logger } from './logger';
import { config } from './index';

const redisClient = createClient({ url: config.redis.url });

redisClient.connect().catch((err) => logger.error('Redis connection error', err));

export { redisClient };
