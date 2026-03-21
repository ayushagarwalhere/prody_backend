import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required'),
    username: z.string().min(1, 'Username is required'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const verifyEmailQuerySchema = z.object({
  query: z.object({
    token: z.string().min(1),
  }),
});
