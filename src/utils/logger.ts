import morgan from 'morgan';
import { appConfig } from '@config/appConfig';

export const requestLogger = morgan(
  appConfig.nodeEnv === 'production' ? 'combined' : 'dev',
);

export const logError = (err: unknown, context?: string) => {
  // eslint-disable-next-line no-console
  console.error(context ?? 'Error', err);
};

