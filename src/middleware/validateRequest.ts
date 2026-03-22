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
        const parsedQuery = schemas.query.parse(req.query);
        req.query = parsedQuery;
        res.locals.query = parsedQuery;
      }
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        req.params = parsedParams;
        res.locals.params = parsedParams;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
