import { Router } from 'express';
import * as adminController from '@controllers/admin.controller';
import { validateRequest } from '@middleware/validateRequest';
import { authMiddleware } from '@middleware/auth';
import { requireAdmin } from '@middleware/role';
import { setScoreSchema, editUserSchema, editEventSchema, getUsersByEventSchema, exportTeamsCSVSchema } from '@validators/admin.validator';

const router = Router();

router.use(authMiddleware, requireAdmin);

// User management
router.get(
  '/users',
  adminController.getAllUsers,
);

router.get(
  '/events/:eventId/users',
  validateRequest({ params: getUsersByEventSchema.shape.params }),
  adminController.getUsersByEvent,
);

router.patch(
  '/users/:userId',
  validateRequest({ 
    params: editUserSchema.shape.params,
    body: editUserSchema.shape.body 
  }),
  adminController.editUser,
);

// Event management
router.patch(
  '/events/:eventId',
  validateRequest({ 
    params: editEventSchema.shape.params,
    body: editEventSchema.shape.body 
  }),
  adminController.editEvent,
);

router.delete(
  '/events/:eventId',
  validateRequest({
    params: editEventSchema.shape.params,
  }),
  adminController.deleteEvent,
);

// Score management
router.post(
  '/score',
  validateRequest({ body: setScoreSchema.shape.body }),
  adminController.setScore,
);

// Export functionality
router.get(
  '/export/teams/csv',
  validateRequest({ query: exportTeamsCSVSchema.shape.query }),
  adminController.exportTeamsAsCSV,
);

export default router;
