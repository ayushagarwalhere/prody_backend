import { z } from 'zod';

export const editEventSchema = z.object({
  params: z.object({
    eventId: z.string().cuid(),
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    mode: z.enum(['SOLO', 'TEAM', 'BOTH']).optional(),
    abstract: z.string().nullable().optional(),
    isLive: z.boolean().optional(),
    minTeamSize: z.number().int().min(1).max(50).optional(),
    maxTeamSize: z.number().int().min(1).max(50).optional(),
    prizePool: z.number().int().min(0).optional(),
  }),
});

export const getUsersByEventSchema = z.object({
  params: z.object({
    eventId: z.string().cuid(),
  }),
});

export const setScoreSchema = z.object({
  body: z.object({
    eventId: z.string().cuid(),
    teamId: z.string().cuid(),
    value: z.number().int().min(0),
  }),
});

export const editUserSchema = z.object({
  params: z.object({
    userId: z.string().cuid(),
  }),
  body: z.object({
    name: z.string().optional(),
    username: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    verified: z.boolean().optional(),
    avatarUrl: z.string().url().optional(),
  }),
});
