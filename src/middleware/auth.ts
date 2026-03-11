import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '@config/appConfig';
import type { UserJwtPayload } from '@custom-types/jwt';

type HttpError = Error & { statusCode?: number };

const httpError = (statusCode: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
};

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token =
    req.cookies?.access_token ??
    req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return next(httpError(401, 'Authentication required'));
  }

  try {
    const decoded = jwt.verify(
      token,
      appConfig.jwtAccessSecret,
    ) as UserJwtPayload;
    req.user = decoded;
    next();
  } catch {
    return next(httpError(401, 'Invalid or expired token'));
  }
};
