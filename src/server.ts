import 'dotenv/config';
import app from './app';

const server = app.listen(process.env.PORT || 3000, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Server running on port ${process.env.PORT || 3000} (${process.env.NODE_ENV || 'development'})`,
  );
});

export default server;
