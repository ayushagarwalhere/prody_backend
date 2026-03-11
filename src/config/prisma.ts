import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// #region agent log
fetch('http://127.0.0.1:7390/ingest/67767c4a-d94e-445a-8ae7-8f5dd2ce5cf4', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Debug-Session-Id': 'c99113',
  },
  body: JSON.stringify({
    sessionId: 'c99113',
    runId: 'pre-fix',
    hypothesisId: 'H1',
    location: 'src/config/prisma.ts:4-8',
    message: 'Created PrismaPg adapter',
    data: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion agent log

let prismaInstance: PrismaClient;

try {
  prismaInstance = new PrismaClient({ adapter });
  // #region agent log
  fetch('http://127.0.0.1:7390/ingest/67767c4a-d94e-445a-8ae7-8f5dd2ce5cf4', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'c99113',
    },
    body: JSON.stringify({
      sessionId: 'c99113',
      runId: 'pre-fix',
      hypothesisId: 'H2',
      location: 'src/config/prisma.ts:10-22',
      message: 'PrismaClient constructed successfully',
      data: {},
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log
} catch (err) {
  // #region agent log
  fetch('http://127.0.0.1:7390/ingest/67767c4a-d94e-445a-8ae7-8f5dd2ce5cf4', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'c99113',
    },
    body: JSON.stringify({
      sessionId: 'c99113',
      runId: 'pre-fix',
      hypothesisId: 'H3',
      location: 'src/config/prisma.ts:24-38',
      message: 'PrismaClient construction failed',
      data: {
        name: (err as any)?.name,
        message: (err as any)?.message,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log
  throw err;
}

export const prisma = prismaInstance;

