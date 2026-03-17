import type { Request, Response, NextFunction } from 'express';
import * as adminService from '@services/admin.service';

export const setScore = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { eventId, teamId, value } = req.body as {
      eventId: string;
      teamId: string;
      value: number;
    };
    const score = await adminService.setScore(eventId, teamId, value);
    res.status(200).json(score);
  } catch (err) {
    next(err);
  }
};

export const editUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params as { userId: string };
    const updates = req.body as {
      name?: string;
      username?: string;
      email?: string;
      role?: 'USER' | 'ADMIN';
      verified?: boolean;
      avatarUrl?: string;
    };
    const user = await adminService.editUser(userId, updates);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};
