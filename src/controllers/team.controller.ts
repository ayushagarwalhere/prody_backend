import type { Request, Response, NextFunction } from 'express';
import * as teamService from '@services/team.service';

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const { name, eventId } = req.body as { name: string, eventId: string };
    const team = await teamService.createTeam(userId, name, eventId);
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

export const deleteTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requesterId = req.user!.sub;
    const { teamId } = req.body as { teamId: string };
    const result = await teamService.deleteTeam(requesterId, teamId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { teamId } = req.params as { teamId: string };
    const team = await teamService.getTeamById(teamId);
    res.status(200).json(team);
  } catch (err) {
    next(err);
  }
};

