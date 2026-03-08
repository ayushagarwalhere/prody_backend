import type { Request, Response, NextFunction } from 'express';
import * as eventService from '@services/event.service';

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
    const { id } = req.params as { id: string };
    const event = await eventService.getEventById(id);
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
    const { title, description, mode } = req.body as {
      title: string;
      description: string;
      mode: 'SOLO' | 'TEAM' | 'BOTH';
    };
    const event = await eventService.createEvent({ title, description, mode });
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
    const { id: eventId } = req.params as { id: string };
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
