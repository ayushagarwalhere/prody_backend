import type { Request, Response, NextFunction } from 'express';
import * as authService from '@services/auth.service';
import { setAuthCookies, clearAuthCookies } from '@utils/cookies';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, name, username } = req.body as { email: string; password: string; name: string; username: string };
    const result = await authService.register(email, password, name, username);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body as { username: string; password: string };
    const result = await authService.login(username, password);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json({ user: result.user });
  } catch (err) {
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    await authService.logout(refreshToken);
    clearAuthCookies(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    const result = await authService.refreshTokens(refreshToken);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json({ message: 'Token refreshed' });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.query as { token: string };
    await authService.verifyEmail(token);
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body as { email: string };
    await authService.forgotPassword(email);
    res.status(200).json({
      message: 'You will recieve an email with a link to reset your password.',
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, password } = req.body as { token: string; password: string };
    await authService.resetPassword(token, password);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};
