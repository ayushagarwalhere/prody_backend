// Simple runtime configuration without .env validation.
// Adjust these values directly as needed.
export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: (process.env.NODE_ENV as string) || 'development',

  // Database URL is read by Prisma from prisma.config.ts using process.env.DATABASE_URL

  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  jwtAccessExpiresInMinutes: Number(process.env.JWT_ACCESS_EXPIRES_IN_MINUTES || 15),
  jwtRefreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || 7),

  cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
  cookieSecure: process.env.COOKIE_SECURE === 'true',

  resendApiKey: process.env.RESEND_API_KEY || 'dev-resend-key-change-me',
  emailFrom: process.env.EMAIL_FROM || 'onboarding@resend.dev',

  appUrl: process.env.APP_URL || 'http://localhost:3001' || 'http://localhost:3000',
};

