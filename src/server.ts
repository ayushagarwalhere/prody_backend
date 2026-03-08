import { env } from '@config/env';
import { getRedisClient } from '@config/redis';
import app from './app';

const server = app.listen(env.PORT, () => {
  getRedisClient();
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
});

export default server;
