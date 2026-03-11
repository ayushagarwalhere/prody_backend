import { prisma } from '@config/prisma';
import { invalidateLeaderboardCache } from './leaderboard.service';

type HttpError = Error & { statusCode?: number };

const httpError = (statusCode: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
};

const badRequest = (message: string) => httpError(400, message);
const notFound = (message: string) => httpError(404, message);

export const setScore = async (
  eventId: string,
  teamId: string,
  value: number,
) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw notFound('Event not found');

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw notFound('Team not found');

  const registration = await prisma.eventRegistration.findUnique({
    where: { eventId_teamId: { eventId, teamId } },
  });
  if (!registration) {
    throw badRequest('Team is not registered for this event');
  }

  const score = await prisma.score.upsert({
    where: { eventId_teamId: { eventId, teamId } },
    create: { eventId, teamId, value },
    update: { value },
  });

  await invalidateLeaderboardCache(eventId);

  return score;
};
