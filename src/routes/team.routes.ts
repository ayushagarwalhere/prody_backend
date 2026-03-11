import { Router } from 'express';
import * as teamController from '@controllers/team.controller';
import { validateRequest } from '@middleware/validateRequest';
import { authMiddleware } from '@middleware/auth';
import {
  createTeamSchema,
  joinTeamSchema,
  removeMemberSchema,
  submitTeamSchema,
} from '@validators/team.validator';

const router = Router();

router.use(authMiddleware);

router.post(
  '/create',
  validateRequest({ body: createTeamSchema.shape.body }),
  teamController.createTeam,
);

router.post(
  '/join',
  validateRequest({ body: joinTeamSchema.shape.body }),
  teamController.joinTeam,
);

router.post(
  '/remove-member',
  validateRequest({ body: removeMemberSchema.shape.body }),
  teamController.removeMember,
);

router.post(
  '/submit',
  validateRequest({ body: submitTeamSchema.shape.body }),
  teamController.submitTeam,
);

export default router;
