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
