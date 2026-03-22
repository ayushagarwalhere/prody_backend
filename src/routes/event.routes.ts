import { Router } from 'express';
import * as eventController from '@controllers/event.controller';
import * as adminController from '@controllers/admin.controller';
import { validateRequest } from '@middleware/validateRequest';
import { authMiddleware } from '@middleware/auth';
import { requireAdmin } from '@middleware/role';
import {
  createEventSchema,
  eventIdParamSchema,
  registerForEventSchema,
} from '@validators/event.validator';
import { editEventSchema } from '@validators/admin.validator';

const router = Router();

router.get('/', eventController.listEvents);
router.get(
  '/my-registrations',
  authMiddleware,
  eventController.getUserRegistrations,
);
router.get(
  '/:eventId',
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

router.patch(
  '/:eventId',
  authMiddleware,
  requireAdmin,
  validateRequest({ 
    params: editEventSchema.shape.params,
    body: editEventSchema.shape.body 
  }),
  adminController.editEvent,
);

router.post(
  '/:eventId/register',
  authMiddleware,
  validateRequest({
    params: registerForEventSchema.shape.params,
    body: registerForEventSchema.shape.body,
  }),
  eventController.registerForEvent,
);

export default router;
