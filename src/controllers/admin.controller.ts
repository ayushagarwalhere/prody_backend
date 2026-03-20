import type { Request, Response, NextFunction } from 'express';
import * as adminService from '@services/admin.service';

export const editEvent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { eventId } = req.params as { eventId: string };
    const data = req.body as {
      title?: string;
      description?: string;
      mode?: 'SOLO' | 'TEAM' | 'BOTH';
      abstract?: string | null;
      isLive?: boolean;
      minTeamSize?: number;
      maxTeamSize?: number;
      prizePool?: number;
    };
    const event = await adminService.editEvent(eventId, data);
    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const getUsersByEvent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { eventId } = req.params as { eventId: string };
    const result = await adminService.getUsersByEvent(eventId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const exportTeamsAsCSV = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { eventId } = req.query as { eventId?: string };
    const result = await adminService.exportTeamsAsCSV(eventId);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    res.status(200).send(result.csvContent);
  } catch (err) {
    next(err);
  }
};

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
