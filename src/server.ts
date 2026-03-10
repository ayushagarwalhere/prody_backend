import 'dotenv/config';
import { getRedisClient } from '@config/redis';
import app from './app';

const server = app.listen(process.env.PORT || 3000, () => {
  getRedisClient();
  // eslint-disable-next-line no-console
  console.log(
    `Server running on port ${process.env.PORT || 3000} (${process.env.NODE_ENV || 'development'})`,
  );
});

export default server;
