import type { Role } from '@prisma/client';

export interface UserJwtPayload {
  sub: string;
  email: string;
  role: Role;
}
