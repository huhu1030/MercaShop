import dotenv from 'dotenv';

dotenv.config({ quiet: true });

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
  },
  gcsBucketName: process.env.GCS_BUCKET_NAME ?? '',
  oauth: {
    google: {
      clientId: process.env.OAUTH_GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET ?? '',
    },
    apple: {
      clientId: process.env.OAUTH_APPLE_CLIENT_ID ?? '',
      clientSecret: process.env.OAUTH_APPLE_CLIENT_SECRET ?? '',
    },
    facebook: {
      clientId: process.env.OAUTH_FACEBOOK_CLIENT_ID ?? '',
      clientSecret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET ?? '',
    },
  },
  apiUrl: process.env.API_URL ?? 'http://localhost:3030',
  mollieKey: process.env.MOLLIE_KEY ?? '',
  mail: {
    address: process.env.MAIL ?? '',
    password: process.env.MAIL_PASSWORD ?? '',
    server: process.env.MAIL_SERVER ?? 'smtp-mail.outlook.com',
  },
} as const;
