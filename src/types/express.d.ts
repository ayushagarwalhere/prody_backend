import type { UserJwtPayload } from './jwt';

declare global {
  namespace Express {
    interface Request {
      user?: UserJwtPayload;
    }
  }
}

export {};

