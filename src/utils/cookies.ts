import type { Response } from 'express';
import { appConfig } from '@config/appConfig';

const cookieOptions = {
  httpOnly: true,
  secure: appConfig.cookieSecure,
  sameSite: 'lax' as const,
  domain: appConfig.cookieDomain,
};

const accessTokenMaxAgeMs =
  appConfig.jwtAccessExpiresInMinutes * 60 * 1000;
const refreshTokenMaxAgeMs =
  appConfig.jwtRefreshExpiresInDays * 24 * 60 * 60 * 1000;

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: accessTokenMaxAgeMs,
  });
  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenMaxAgeMs,
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('access_token', { domain: appConfig.cookieDomain });
  res.clearCookie('refresh_token', { domain: appConfig.cookieDomain });
};
