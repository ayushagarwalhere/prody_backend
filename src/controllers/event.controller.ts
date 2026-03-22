import type { Request, Response, NextFunction } from 'express';
import * as eventService from '@services/event.service';

export const getUserRegistrations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.sub;
    const registrations = await eventService.getUserRegistrations(userId);
    res.status(200).json(registrations);
  } catch (err) {
    next(err);
  }
};

export const listEvents = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const events = await eventService.listEvents();
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { eventId } = req.params as { eventId: string };
    const event = await eventService.getEventById(eventId);
    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
};

export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, mode, abstract, isLive, minTeamSize, maxTeamSize } = req.body as {
      title: string;
      description: string;
      mode: 'SOLO' | 'TEAM' | 'BOTH';
      abstract?: string | null;
      isLive?: boolean;
      minTeamSize?: number;
      maxTeamSize?: number;
    };
    const event = await eventService.createEvent({
      title,
      description,
      mode,
      abstract,
      isLive,
      minTeamSize,
      maxTeamSize,
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

export const registerForEvent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { eventId } = req.params as { eventId: string };
    const userId = req.user!.sub;
    const { teamId } = (req.body as { teamId?: string }) ?? {};
    const registration = await eventService.registerForEvent(
      eventId,
      userId,
      teamId,
    );
    res.status(201).json(registration);
  } catch (err) {
    next(err);
  }
};
