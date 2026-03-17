import { Router } from 'express';
import * as adminController from '@controllers/admin.controller';
import { validateRequest } from '@middleware/validateRequest';
import { authMiddleware } from '@middleware/auth';
import { requireAdmin } from '@middleware/role';
import { setScoreSchema, editUserSchema } from '@validators/admin.validator';

const router = Router();

router.use(authMiddleware, requireAdmin);

router.post(
  '/score',
  validateRequest({ body: setScoreSchema.shape.body }),
  adminController.setScore,
);

router.patch(
  '/users/:userId',
  validateRequest({ 
    params: editUserSchema.shape.params,
    body: editUserSchema.shape.body 
  }),
  adminController.editUser,
);

export default router;
