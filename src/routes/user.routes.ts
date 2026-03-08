import { Router } from 'express';
import * as userController from '@controllers/user.controller';
import { authMiddleware } from '@middleware/auth';

const router = Router();

router.get('/profile', authMiddleware, userController.getProfile);

export default router;
