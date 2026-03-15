import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger docs
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const swaggerDoc = require('../dist/swagger.json');
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch {
  // Swagger not generated yet
}

// Tsoa generated routes registered after middleware/controllers are created (Task 9)
// import { RegisterRoutes } from './generated/routes';
// RegisterRoutes(app);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(errorHandler);
