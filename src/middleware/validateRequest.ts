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
        const parsedBody = schemas.body.parse(req.body);
        res.locals.body = parsedBody;
        if (req.body && typeof req.body === 'object') {
          Object.assign(req.body, parsedBody);
        } else {
          res.locals.body = parsedBody;
        }
      }
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        res.locals.query = parsedQuery;
      }
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        res.locals.params = parsedParams;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
