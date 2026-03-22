import { z } from 'zod';
import { EventMode } from '@prisma/client';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string(),
    mode: z.nativeEnum(EventMode),
    abstract: z.string().url().optional(),
    isLive: z.boolean().optional(),
    minTeamSize: z.number().int().min(1).max(50).optional(),
    maxTeamSize: z.number().int().min(1).max(50).optional(),
  }).refine((data) => {
    if (data.minTeamSize && data.maxTeamSize && data.minTeamSize > data.maxTeamSize) {
      return false;
    }
    return true;
  }, {
    message: "minTeamSize cannot be greater than maxTeamSize",
    path: ["minTeamSize"]
  }),
});

export const eventIdParamSchema = z.object({
  params: z.object({
    eventId: z.string().cuid(),
  }),
});

export const registerForEventSchema = z.object({
  params: z.object({
    eventId: z.string().cuid(),
  }),
  body: z.object({
    teamId: z.string().cuid().optional(),
  }),
});
