import type { Request, Response, NextFunction } from 'express';
import * as teamService from '@services/team.service';

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { name } = req.body as { name: string };
    const team = await teamService.createTeam(userId, name);
    res.status(201).json(team);
  } catch (err) {
    next(err);
  }
};

export const joinTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { teamCode } = req.body as { teamCode: string };
    const team = await teamService.joinTeam(userId, teamCode);
    res.status(200).json(team);
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requesterId = req.user!.sub;
    const { teamId, userId } = req.body as { teamId: string; userId: string };
    const team = await teamService.removeMember(requesterId, teamId, userId);
    res.status(200).json(team);
  } catch (err) {
    next(err);
  }
};

export const submitTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { teamId } = req.body as { teamId: string };
    const team = await teamService.submitTeam(userId, teamId);
    res.status(200).json(team);
  } catch (err) {
    next(err);
  }
};
