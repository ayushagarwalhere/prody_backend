import type { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';

type HttpError = Error & { statusCode?: number };

const httpError = (statusCode: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
};

export const requireRole = (...allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(httpError(403, 'Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(httpError(403, 'Insufficient permissions'));
    }
    next();
  };

export const requireAdmin = requireRole(Role.ADMIN);
