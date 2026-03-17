import { z } from 'zod';

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
