import { randomBytes } from 'crypto';
import { prisma } from '@config/prisma';

type HttpError = Error & { statusCode?: number };

const httpError = (statusCode: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
};

const badRequest = (message: string) => httpError(400, message);
const forbidden = (message: string) => httpError(403, message);
const notFound = (message: string) => httpError(404, message);

const TEAM_CODE_LENGTH = 6;

const generateTeamCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code: string;
  let existing: { id: string } | null;
  do {
    code = randomBytes(TEAM_CODE_LENGTH)
      .toString('base64')
      .replace(/[+/=]/g, '')
      .slice(0, TEAM_CODE_LENGTH)
      .toUpperCase();
    if (code.length < TEAM_CODE_LENGTH) {
      code = code.padEnd(TEAM_CODE_LENGTH, chars[0]!);
    }
    existing = await prisma.team.findUnique({
      where: { teamCode: code },
      select: { id: true },
    });
  } while (existing);
  return code;
};

export const createTeam = async (userId: string, name: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  const teamCode = await generateTeamCode();

  const team = await prisma.team.create({
    data: {
      name,
      teamCode,
      adminId: userId,
      eventId,
      members: {
        create: { userId },
      },
    },
    include: { members: true },
  });

  return team;
};

export const joinTeam = async (userId: string, teamCode: string) => {
  const team = await prisma.team.findUnique({
    where: { teamCode: teamCode.toUpperCase() },
    include: { 
      members: true,
      event: true
    },
  });
  if (!team) {
    throw notFound('Team not found');
  }
  if (team.registered) {
    throw badRequest('Team already registered the event. You cannot join');
  }
  const alreadyMember = team.members.some((m) => m.userId === userId);
  if (alreadyMember) {
    throw badRequest('Already a member of this team');
  }

  // Check team size constraints
  if (team.event) {
    const currentSize = team.members.length;
    if (currentSize >= team.event.maxTeamSize) {
      throw badRequest(`Team is full. Maximum team size is ${team.event.maxTeamSize}`);
    }
  }

  await prisma.teamMember.create({
    data: { userId, teamId: team.id },
  });

  return prisma.team.findUniqueOrThrow({
    where: { id: team.id },
    include: { members: true },
  });
};

export const removeMember = async (
  requesterId: string,
  teamId: string,
  memberUserId: string,
) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });
  if (!team) throw notFound('Team not found');
  if (team.adminId !== requesterId) {
    throw forbidden('Only team admin can remove members');
  }
  if (team.registered) {
    throw badRequest('Cannot modify a registered team');
  }
  if (memberUserId === requesterId) {
    throw badRequest('Team admin cannot remove themselves');
  }

  const member = team.members.find((m) => m.userId === memberUserId);
  if (!member) {
    throw notFound('Member not found in this team');
  }

  await prisma.teamMember.delete({
    where: { userId_teamId: { userId: memberUserId, teamId } },
  });

  return prisma.team.findUniqueOrThrow({
    where: { id: teamId },
    include: { members: true },
  });
};

export const leaveTeam = async (userId: string, teamId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });

  if (!team) {
    throw notFound('Team not found');
  }

  if (team.registered) {
    throw badRequest('Cannot leave a registered team');
  }

  // Check if user is actually a member of this team
  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });

  if (!membership) {
    throw badRequest('You are not a member of this team');
  }

  // Check if user is the admin
  if (team.adminId === userId) {
    throw badRequest('Team admin cannot leave the team. Transfer admin rights or delete the team first.');
  }

  // Remove the user from the team
  await prisma.teamMember.delete({
    where: { userId_teamId: { userId, teamId } },
  });

  return prisma.team.findUniqueOrThrow({
    where: { id: teamId },
    include: { members: true },
  });
};

export const deleteTeam = async (requesterId: string, teamId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });
  
  if (!team) throw notFound('Team not found');
  if (team.adminId !== requesterId) {
    throw forbidden('Only team admin can delete the team');
  }
  if (team.registered) {
    throw badRequest('Cannot delete a registered team');
  }

  // First, delete all team members
  await prisma.teamMember.deleteMany({
    where: { teamId: teamId },
  });

  // Then delete the team
  await prisma.team.delete({
    where: { id: teamId },
  });

  return { message: 'Team deleted successfully' };
};

export const getUserTeamForEvent = async (userId: string, eventId: string) => {
  // Check if user is part of any team for this specific event
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      userId: userId,
      team: {
        eventId: eventId,
      },
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
                },
              },
            },
          },
          event: true,
        },
      },
    },
  });

  if (!teamMember) {
    return { hasTeam: false, team: null };
  }

  const team = teamMember.team;
  const currentSize = team.members.length;
  const minSize = team.event?.minTeamSize ?? 1;
  const maxSize = team.event?.maxTeamSize ?? 4;

  return {
    hasTeam: true,
    team: {
      ...team,
      memberCount: currentSize,
      teamSize: {
        current: currentSize,
        min: minSize,
        max: maxSize,
        canJoin: !team.registered && currentSize < maxSize,
        canRegister: !team.registered && currentSize >= minSize,
      },
      isUserAdmin: team.adminId === userId,
    },
  };
};

export const getTeamById = async (teamId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
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
            },
          },
        },
      },
      event: true,
      registrations: true,
    },
  });

  if (!team) throw notFound('Team not found');

  const currentSize = team.members.length;
  const minSize = team.event?.minTeamSize ?? 1;
  const maxSize = team.event?.maxTeamSize ?? 4;

  return {
    ...team,
    isRegistered: team.registered,
    memberCount: currentSize,
    teamSize: {
      current: currentSize,
      min: minSize,
      max: maxSize,
      canJoin: !team.registered && currentSize < maxSize,
      canRegister: !team.registered && currentSize >= minSize,
    },
  };
};

