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

export const editUser = async (
  userId: string,
  updates: {
    name?: string;
    username?: string;
    email?: string;
    role?: 'USER' | 'ADMIN';
    verified?: boolean;
    avatarUrl?: string;
  },
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('User not found');

  // Check if username or email already exists (if being updated)
  if (updates.username && updates.username !== user.username) {
    const existingUser = await prisma.user.findFirst({
      where: { username: updates.username },
    });
    if (existingUser) throw badRequest('Username already exists');
  }

  if (updates.email && updates.email !== user.email) {
    const existingUser = await prisma.user.findFirst({
      where: { email: updates.email },
    });
    if (existingUser) throw badRequest('Email already exists');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      verified: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
