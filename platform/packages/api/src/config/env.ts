import dotenv from 'dotenv';
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'dev',
  port: parseInt(process.env.PORT ?? '3030', 10),
  databaseUrl: process.env.DATABASE_URL ?? '',
  databaseName: process.env.DATABASE_NAME ?? '',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') ?? [],
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? '',
  },
  mollieKey: process.env.MOLLIE_KEY ?? '',
  mail: {
    address: process.env.MAIL ?? '',
    password: process.env.MAIL_PASSWORD ?? '',
    server: process.env.MAIL_SERVER ?? 'smtp-mail.outlook.com',
  },
  apiUrl: process.env.API_URL ?? 'http://localhost:3030',
} as const;
