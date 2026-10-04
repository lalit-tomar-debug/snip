import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import urlRoutes from './routes/urls.js';
import { redirect } from './routes/redirect.js';
import { connectRedis } from './config/redis.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api', urlRoutes);
app.get('/:code', redirect); // must stay last: it matches any short code

const PORT = process.env.PORT || 5000;

async function start() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  await connectRedis();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
