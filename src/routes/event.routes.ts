import { Router } from 'express';
import * as eventController from '@controllers/event.controller';
import { validateRequest } from '@middleware/validateRequest';
import { authMiddleware } from '@middleware/auth';
import { requireAdmin } from '@middleware/role';
import {
  createEventSchema,
  eventIdParamSchema,
  registerForEventSchema,
} from '@validators/event.validator';

const router = Router();

router.get('/', eventController.listEvents);
router.get(
  '/my-registrations',
  authMiddleware,
  eventController.getUserRegistrations,
);
router.get(
  '/:id',
  validateRequest({ params: eventIdParamSchema.shape.params }),
  eventController.getEventById,
);

router.post(
  '/',
  authMiddleware,
  requireAdmin,
  validateRequest({ body: createEventSchema.shape.body }),
  eventController.createEvent,
);

router.post(
  '/:id/register',
  authMiddleware,
  validateRequest({
    params: eventIdParamSchema.shape.params,
    body: registerForEventSchema.shape.body,
  }),
  eventController.registerForEvent,
);

export default router;
