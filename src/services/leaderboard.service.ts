import { getRedisClient } from '@config/redis';
import { prisma } from '@config/prisma';

type HttpError = Error & { statusCode?: number };

const httpError = (statusCode: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
};

const notFound = (message: string) => httpError(404, message);

const CACHE_PREFIX = 'leaderboard:';
const CACHE_TTL_SECONDS = 60;

export const getLeaderboard = async (eventId: string) => {
  const redis = getRedisClient();
  const cacheKey = `${CACHE_PREFIX}${eventId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as Array<{
      rank: number;
      teamId: string;
      teamName: string;
      score: number;
    }>;
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      scores: {
        include: {
          team: { select: { id: true, name: true } },
        },
        orderBy: { value: 'desc' },
      },
    },
  });

  if (!event) {
    throw notFound('Event not found');
  }

  const rankings = event.scores.map((s, index) => ({
    rank: index + 1,
    teamId: s.team.id,
    teamName: s.team.name,
    score: s.value,
  }));

  await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(rankings));

  return rankings;
};

export const invalidateLeaderboardCache = async (eventId: string) => {
  const redis = getRedisClient();
  await redis.del(`${CACHE_PREFIX}${eventId}`);
};
