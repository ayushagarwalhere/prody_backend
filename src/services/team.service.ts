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

export const createTeam = async (userId: string, name: string) => {
  const teamCode = await generateTeamCode();
  const team = await prisma.team.create({
    data: {
      name,
      teamCode,
      adminId: userId,
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
    include: { members: true },
  });
  if (!team) {
    throw notFound('Team not found');
  }
  if (team.submitted) {
    throw badRequest('Cannot join a submitted team');
  }
  const alreadyMember = team.members.some((m) => m.userId === userId);
  if (alreadyMember) {
    throw badRequest('Already a member of this team');
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
  if (team.submitted) {
    throw badRequest('Cannot modify a submitted team');
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

export const submitTeam = async (userId: string, teamId: string) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });
  if (!team) throw notFound('Team not found');
  if (team.adminId !== userId) {
    throw forbidden('Only team admin can submit the team');
  }
  if (team.submitted) {
    throw badRequest('Team is already submitted');
  }

  return prisma.team.update({
    where: { id: teamId },
    data: { submitted: true },
    include: { members: true },
  });
};
