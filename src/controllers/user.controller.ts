import type { Request, Response, NextFunction } from 'express';
import * as userService from '@services/user.service';

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const profile = await userService.getProfile(userId);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};
