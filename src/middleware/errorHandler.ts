import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logError } from '@utils/logger';

// Global error handler
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.flatten(),
    });
  }

  const anyErr = err as { statusCode?: number; message?: string };
  const statusCode = anyErr.statusCode && anyErr.statusCode >= 400
    ? anyErr.statusCode
    : 500;
  const message =
    anyErr.message || (statusCode === 500 ? 'Internal server error' : 'Error');

  if (statusCode === 500) {
    logError(err, 'Unhandled error');
  }

  return res.status(statusCode).json({ message });
};

