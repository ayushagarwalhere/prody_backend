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

export const editEvent = async (
  eventId: string,
  data: {
    title?: string;
    description?: string;
    mode?: 'SOLO' | 'TEAM' | 'BOTH';
    abstract?: string | null;
    isLive?: boolean;
    minTeamSize?: number;
    maxTeamSize?: number;
    prizePool?: number;
  },
) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw notFound('Event not found');

  // Validate team size constraints if provided
  if (data.minTeamSize !== undefined && data.maxTeamSize !== undefined) {
    if (data.minTeamSize > data.maxTeamSize) {
      throw badRequest('minTeamSize cannot be greater than maxTeamSize');
    }
  }

  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: data.title,
      description: data.description,
      mode: data.mode,
      abstract: data.abstract ?? null,
      isLive: data.isLive,
      minTeamSize: data.minTeamSize,
      maxTeamSize: data.maxTeamSize,
      prizePool: data.prizePool,
    },
  });

  return updatedEvent;
};

export const deleteEvent = async (eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw notFound('Event not found');

  await prisma.$transaction(async (tx) => {
    const teams = await tx.team.findMany({
      where: { eventId },
      select: { id: true },
    });

    const teamIds = teams.map((team) => team.id);

    if (teamIds.length > 0) {
      await tx.score.deleteMany({
        where: { teamId: { in: teamIds } },
      });

      await tx.eventRegistration.deleteMany({
        where: { teamId: { in: teamIds } },
      });

      await tx.teamMember.deleteMany({
        where: { teamId: { in: teamIds } },
      });

      await tx.team.deleteMany({
        where: { id: { in: teamIds } },
      });
    }

    await tx.score.deleteMany({
      where: { eventId },
    });

    await tx.eventRegistration.deleteMany({
      where: { eventId },
    });

    await tx.event.delete({
      where: { id: eventId },
    });
  });

  await invalidateLeaderboardCache(eventId);

  return {
    message: 'Event deleted successfully',
    eventId,
  };
};

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      verified: true,
      avatarUrl: true,
      createdAt: true,
      role: true,
      _count: {
        select: {
          teams: true,
          registrations: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
};

export const getUsersByEvent = async (eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw notFound('Event not found');

  // Get solo registrations
  const soloRegistrations = await prisma.eventRegistration.findMany({
    where: {
      eventId: eventId,
      userId: { not: null },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
  });

  // Get team registrations
  const teamRegistrations = await prisma.eventRegistration.findMany({
    where: {
      eventId: eventId,
      teamId: { not: null },
    },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  avatarUrl: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Combine and deduplicate users
  const userMap = new Map();

  // Add solo registered users
  soloRegistrations.forEach(reg => {
    if (reg.user) {
      userMap.set(reg.user.id, {
        ...reg.user,
        registrationType: 'solo',
        registrationDate: reg.createdAt,
      });
    }
  });

  // Add team registered users
  teamRegistrations.forEach(reg => {
    if (reg.team) {
      const team = reg.team;
      team.members.forEach(member => {
        if (member.user && !userMap.has(member.user.id)) {
          userMap.set(member.user.id, {
            ...member.user,
            registrationType: 'team',
            registrationDate: reg.createdAt,
            teamName: team.name,
            teamCode: team.teamCode,
          });
        }
      });
    }
  });

  return {
    eventId: eventId,
    eventTitle: event.title,
    totalUsers: userMap.size,
    users: Array.from(userMap.values()).sort((a, b) => 
      new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
    ),
  };
};

export const exportTeamsAsCSV = async (eventId?: string) => {
  let teams;
  
  if (eventId) {
    // Get teams for specific event
    teams = await prisma.team.findMany({
      where: { eventId: eventId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  } else {
    // Get all teams
    teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Generate CSV
  const headers = [
    'Team ID',
    'Team Name',
    'Team Code',
    'Event ID',
    'Event Title',
    'Registered',
    'Member Count',
    'Admin ID',
    'Admin Name',
    'Admin Username',
    'Admin Email',
    'Members (ID|Name|Username|Email)',
    'Created At'
  ];

  const csvRows = teams.map(team => {
    const admin = team.members.find(member => member.userId === team.adminId);
    const membersList = team.members
      .map(member => `${member.user.id}|${member.user.name}|${member.user.username}|${member.user.email}`)
      .join('; ');

    return [
      team.id,
      team.name,
      team.teamCode,
      team.eventId,
      team.event.title,
      team.registered ? 'Yes' : 'No',
      team.members.length.toString(),
      team.adminId,
      admin?.user.name || 'N/A',
      admin?.user.username || 'N/A',
      admin?.user.email || 'N/A',
      membersList,
      team.createdAt.toISOString()
    ];
  });

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return {
    filename: eventId 
      ? `teams_event_${eventId}_${new Date().toISOString().split('T')[0]}.csv`
      : `all_teams_${new Date().toISOString().split('T')[0]}.csv`,
    csvContent,
    totalTeams: teams.length
  };
};

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
    verified?: boolean;
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
      verified: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
