import { Router } from 'express';
import * as leaderboardController from '@controllers/leaderboard.controller';
import { validateRequest } from '@middleware/validateRequest';
import { eventIdParamSchema } from '@validators/leaderboard.validator';

const router = Router();

router.get(
  '/:eventId',
  validateRequest({ params: eventIdParamSchema.shape.params }),
  leaderboardController.getLeaderboard,
);

export default router;
