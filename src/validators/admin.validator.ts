import { z } from 'zod';

export const setScoreSchema = z.object({
  body: z.object({
    eventId: z.string().cuid(),
    teamId: z.string().cuid(),
    value: z.number().int().min(0),
  }),
});
