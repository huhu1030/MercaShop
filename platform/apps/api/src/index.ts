import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log(`API running on port ${env.port}`);
  console.log(`Swagger docs at http://localhost:${env.port}/docs`);
});

connectDatabase().catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
