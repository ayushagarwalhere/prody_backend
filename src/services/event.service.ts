import { EventMode } from '@prisma/client';
import { prisma } from '@config/prisma';

type HttpError = Error & { statusCode?: number };

const httpError = (statusCode: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
};

const badRequest = (message: string) => httpError(400, message);
const notFound = (message: string) => httpError(404, message);

export const listEvents = async () => {
  return prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const getEventById = async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: { select: { registrations: true } },
    },
  });
  if (!event) {
    throw notFound('Event not found');
  }
  return event;
};

export const createEvent = async (data: {
  title: string;
  description: string;
  mode: EventMode;
  abstract?: string | null;
  isLive?: boolean;
}) => {
  return prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      mode: data.mode,
      abstract: data.abstract ?? null,
      isLive: data.isLive ?? false,
    },
  });
};

export const registerForEvent = async (
  eventId: string,
  userId: string,
  teamId?: string,
) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw notFound('Event not found');
  }

  if (!event.isLive) {
    throw badRequest('Registrations are currently closed for this event');
  }

  if (teamId) {
    if (event.mode === 'SOLO') {
      throw badRequest('This event does not allow team registration');
    }
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });
    if (!team) throw notFound('Team not found');
    if (team.adminId !== userId) {
      throw badRequest('Only the team admin can register the team for events');
    }
    if (team.submitted === false) {
      throw badRequest('Team must be submitted before registering for events');
    }
    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_teamId: { eventId, teamId } },
    });
    if (existing) throw badRequest('Team already registered for this event');

    return prisma.eventRegistration.create({
      data: { eventId, teamId },
    });
  }

  if (event.mode === 'TEAM') {
    throw badRequest('This event requires team registration');
  }
  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (existing) throw badRequest('Already registered for this event');

  return prisma.eventRegistration.create({
    data: { eventId, userId },
  });
};
