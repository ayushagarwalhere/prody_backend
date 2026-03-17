import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { prisma } from '@config/prisma';
import { appConfig } from '@config/appConfig';
import { getRandomAvatarUrl } from '@utils/avatars';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service';

const SALT_ROUNDS = 10;
const VERIFICATION_EXPIRY_HOURS = 1;
const PASSWORD_RESET_EXPIRY_MINUTES = 15;

type Role = 'USER' | 'ADMIN';

type HttpError = Error & { statusCode?: number };

const httpError = (statusCode: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.statusCode = statusCode;
  return err;
};

const badRequest = (message: string) => httpError(400, message);
const unauthorized = (message: string) => httpError(401, message);
const notFound = (message: string) => httpError(404, message);

export type TokenPair = { accessToken: string; refreshToken: string };

const generateAccessToken = (userId: string, email: string, role: Role) =>
  jwt.sign(
    { sub: userId, email, role },
    appConfig.jwtAccessSecret,
    { expiresIn: `${appConfig.jwtAccessExpiresInMinutes}m` },
  );

const generateRefreshToken = () =>
  randomBytes(32).toString('hex');

export const register = async (
  email: string,
  password: string,
  name: string,
  username: string,
): Promise<{ user: { id: string; email: string; name: string; username: string; verified: boolean }; message: string }> => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw badRequest('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const verificationToken = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + VERIFICATION_EXPIRY_HOURS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      username,
      avatarUrl: getRandomAvatarUrl(),
      emailVerificationTokens: {
        create: {
          token: verificationToken,
          expiresAt,
        },
      },
    },
  });

  const verificationLink = `${appConfig.appUrl}/auth/verify-email?token=${verificationToken}`;
  await sendVerificationEmail(user.email, verificationLink);

  return {
    user: { id: user.id, email: user.email, name: user.name, username: user.username, verified: user.verified },
    message: 'Registration successful. Please check your email to verify your account.',
  };
};

export const login = async (
  username: string,
  password: string,
): Promise<TokenPair & { user: { id: string; username: string; role: Role } }> => {
  const user = await prisma.user.findFirst({ where: { username } });

  if (!user) {
    throw unauthorized('Invalid username or password');
  }
  if (!user.verified) {
    throw badRequest('Please verify your email before logging in');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw unauthorized('Invalid username or password');
  }

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken();
  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(
    refreshExpiresAt.getDate() + appConfig.jwtRefreshExpiresInDays,
  );

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: refreshExpiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, role: user.role },
  };
};

export const logout = async (refreshToken: string | undefined): Promise<void> => {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { isRevoked: true },
  });
};

export const refreshTokens = async (
  refreshToken: string | undefined,
): Promise<TokenPair> => {
  if (!refreshToken) {
    throw unauthorized('Refresh token required');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (
    !stored ||
    stored.isRevoked ||
    stored.expiresAt < new Date() ||
    stored.replacedByToken
  ) {
    throw unauthorized('Invalid or expired refresh token');
  }

  const newAccessToken = generateAccessToken(
    stored.user.id,
    stored.user.email,
    stored.user.role,
  );
  const newRefreshToken = generateRefreshToken();
  const refreshExpiresAt = new Date();
  refreshExpiresAt.setDate(
    refreshExpiresAt.getDate() + appConfig.jwtRefreshExpiresInDays,
  );

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true, replacedByToken: newRefreshToken },
    }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.userId,
        expiresAt: refreshExpiresAt,
      },
    }),
  ]);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const verifyEmail = async (token: string): Promise<void> => {
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.consumedAt || record.expiresAt < new Date()) {
    throw badRequest('Invalid or expired verification link');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { verified: true },
    }),
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
  ]);
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return;
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + PASSWORD_RESET_EXPIRY_MINUTES);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const resetLink = `${appConfig.appUrl}/auth/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetLink);
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.consumedAt || record.expiresAt < new Date()) {
    throw badRequest('Invalid or expired reset link');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
  ]);
};
