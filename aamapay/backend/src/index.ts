import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { transactionRouter } from './routes/transactions.js';
import { claimRouter } from './routes/claims.js';
import { agentRouter } from './routes/agents.js';
import { userRouter } from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/claims', claimRouter);
app.use('/api/agents', agentRouter);
app.use('/api/users', userRouter);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`AamaPay API running on port ${PORT}`);
  console.log('Test endpoint: curl -X POST http://localhost:3001/api/transactions/create -H "Content-Type: application/json" -d \'{"amount": 0.1}\'');
});

export default app;