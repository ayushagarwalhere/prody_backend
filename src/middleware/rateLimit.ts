import type { NextFunction, Request, Response } from 'express';
import { getRedisClient } from '@config/redis';

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;

type HttpError = Error & { statusCode?: number };

const httpError = (statusCode: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
};

export const rateLimitMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const ip = (req.ip ?? req.socket.remoteAddress ?? 'unknown').toString();
  const key = `ratelimit:${ip}`;

  try {
    const redis = getRedisClient();
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.pexpire(key, WINDOW_MS);
    }
    if (current > MAX_REQUESTS) {
      throw httpError(429, 'Too many requests');
    }
    next();
  } catch (err) {
    next(err);
  }
};
