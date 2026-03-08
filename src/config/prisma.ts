import { PrismaClient } from '@prisma/client';

// Simple Prisma client without global caching/extra logging.
export const prisma = new PrismaClient();

