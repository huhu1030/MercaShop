import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { RegisterRoutes } from './generated/routes';
import { tenantResolver } from './middleware/tenantResolver';
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

// Tenant resolution for all /api routes except tenant config
app.use('/api', (req, res, next) => {
  if (req.path === '/tenants/config') return next();
  return tenantResolver(req, res, next);
});

RegisterRoutes(app);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(errorHandler);
