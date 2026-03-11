import { Resend } from 'resend';
import { appConfig } from '@config/appConfig';

export const resend = new Resend(appConfig.resendApiKey);

