import { resend } from '@config/resend';
import { appConfig } from '@config/appConfig';
import { logError } from '@utils/logger';

export const sendVerificationEmail = async (
  to: string,
  verificationLink: string,
) => {
  try {
    await resend.emails.send({
      from: appConfig.emailFrom,
      to: [to],
      subject: `Verify your email for Prody'26`,
      html: `
        <p>Please verify your email for Prody-26 by clicking the link below:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>This link expires in an hours. Do register before that!</p>
      `,
    });
  } catch (err) {
    logError(err, 'sendVerificationEmail');
    throw err;
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  resetLink: string,
) => {
  try {
    await resend.emails.send({
      from: appConfig.emailFrom,
      to: [to],
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  } catch (err) {
    logError(err, 'sendPasswordResetEmail');
    throw err;
  }
};
