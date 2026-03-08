import Redis from 'ioredis';
import { appConfig } from '@config/appConfig';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(appConfig.redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    redisClient.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Redis error:', err);
    });
  }

  return redisClient;
};

