import { z } from 'zod';

export const eventIdParamSchema = z.object({
  params: z.object({
    eventId: z.string().cuid(),
  }),
});
