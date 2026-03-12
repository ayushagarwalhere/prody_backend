import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

type RequestSchemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validateRequest =
  (schemas: RequestSchemas) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        res.locals.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        res.locals.params = schemas.params.parse(req.params);
      }
      next();
    } catch (err) {
      next(err);
    }
  };