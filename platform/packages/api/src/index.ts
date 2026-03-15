import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

connectDatabase().then(() => {
  app.listen(env.port, () => {
    console.log(`API running on port ${env.port}`);
    console.log(`Swagger docs at http://localhost:${env.port}/docs`);
  });
});
