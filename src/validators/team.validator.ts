import { z } from 'zod';

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    eventId: z.string().min(1),
  }),
});

export const joinTeamSchema = z.object({
  body: z.object({
    teamCode: z.string().min(1),
  }),
});

export const removeMemberSchema = z.object({
  body: z.object({
    teamId: z.string().cuid(),
    userId: z.string().cuid(),
  }),
});

export const getTeamSchema = z.object({
  params: z.object({
    teamId: z.string().cuid(),
  }),
});

export const deleteTeamSchema = z.object({
  body: z.object({
    teamId: z.string().cuid(),
  }),
});
