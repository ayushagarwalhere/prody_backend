import type { Request, Response, NextFunction } from 'express';
import * as leaderboardService from '@services/leaderboard.service';

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { eventId } = req.params as { eventId: string };
    const rankings = await leaderboardService.getLeaderboard(eventId);
    res.status(200).json(rankings);
  } catch (err) {
    next(err);
  }
};
