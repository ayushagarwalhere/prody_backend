import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { requestLogger } from '@utils/logger';
import { rateLimitMiddleware } from '@middleware/rateLimit';
import { errorHandler } from '@middleware/errorHandler';

import authRoutes from '@routes/auth.routes';
import userRoutes from '@routes/user.routes';
import eventRoutes from '@routes/event.routes';
import teamRoutes from '@routes/team.routes';
import leaderboardRoutes from '@routes/leaderboard.routes';
import adminRoutes from '@routes/admin.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(rateLimitMiddleware);

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/events', eventRoutes);
app.use('/teams', teamRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello World Prody-26' });
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

export default app;
