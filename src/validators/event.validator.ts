import { z } from 'zod';
import { EventMode } from '@prisma/client';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string(),
    mode: z.nativeEnum(EventMode),
    abstract: z.string().url().optional(),
    isLive: z.boolean().optional(),
  }),
});

export const eventIdParamSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const registerForEventSchema = z.object({
  body: z.object({
    teamId: z.string().cuid().optional(),
  }),
});
