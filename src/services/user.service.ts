import { prisma } from '@config/prisma';

type HttpError = Error & { statusCode?: number };

const httpError = (statusCode: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
};

const notFound = (message: string) => httpError(404, message);

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      verified: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      teams: {
        include: {
          team: {
            include: {
              members: {
                include: {
                  user: { select: { id: true, name: true, username: true, avatarUrl: true } }
                }
              },
              _count: { select: { members: true } },
            },
          },
        },
      },
      registrations: {
        include: {
          event: { select: { id: true, title: true, description: true, mode: true } },
        },
      },
    },
  });

  if (!user) {
    throw notFound('User not found');
  }

  const teams = user.teams.map((t: any) => ({
    id: t.team.id,
    name: t.team.name,
    team: t.team.members,
    eventId : t.team.eventId,
    teamCode: t.team.teamCode,
    isAdmin: t.team.adminId === userId,
    submitted: t.team.submitted,
    memberCount: t.team._count.members,
  }));

  const events = user.registrations.map((r: any) => ({
    ...r.event,
    registrationType: r.teamId ? 'team' : 'solo',
  }));

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    verified: user.verified,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    teams,
    events,
  };
};
