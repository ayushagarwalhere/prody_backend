import { Router } from 'express';
import * as authController from '@controllers/auth.controller';
import { validateRequest } from '@middleware/validateRequest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailQuerySchema,
} from '@validators/auth.validator';

const router = Router();

router.post(
  '/register',
  validateRequest({ body: registerSchema.shape.body }),
  authController.register,
);

router.post(
  '/login',
  validateRequest({ body: loginSchema.shape.body }),
  authController.login,
);

router.post('/logout', authController.logout);

router.post('/refresh', authController.refresh);

router.get(
  '/verify-email',
  validateRequest({ query: verifyEmailQuerySchema.shape.query }),
  authController.verifyEmail,
);

router.post(
  '/forgot-password',
  validateRequest({ body: forgotPasswordSchema.shape.body }),
  authController.forgotPassword,
);

router.post(
  '/reset-password',
  validateRequest({ body: resetPasswordSchema.shape.body }),
  authController.resetPassword,
);

export default router;
