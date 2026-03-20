import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '@config/appConfig';
import type { UserJwtPayload } from '@custom-types/jwt';
import { prisma } from '@config/prisma';

type HttpError = Error & { statusCode?: number };

const httpError = (statusCode: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
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
  } catch (error) {
    // Token is expired or invalid, try to refresh
    const refreshToken = req.cookies?.refresh_token;
    
    if (!refreshToken) {
      return next(httpError(401, 'Invalid or expired token'));
    }

    try {
      // Verify refresh token and get new tokens
      const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (
        !stored ||
        stored.isRevoked ||
        stored.expiresAt < new Date() ||
        stored.replacedByToken
      ) {
        return next(httpError(401, 'Invalid or expired refresh token'));
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { sub: stored.user.id, email: stored.user.email, role: stored.user.role },
        appConfig.jwtAccessSecret,
        { expiresIn: `${appConfig.jwtAccessExpiresInMinutes}m` },
      );

      // Set new access token in cookie
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: appConfig.cookieSecure,
        sameSite: 'strict',
        maxAge: appConfig.jwtAccessExpiresInMinutes * 60 * 1000,
        domain: appConfig.cookieDomain,
      });

      // Set user in request
      req.user = {
        sub: stored.user.id,
        email: stored.user.email,
        role: stored.user.role,
      };

      next();
    } catch (refreshError) {
      return next(httpError(401, 'Failed to refresh token'));
    }
  }
};
