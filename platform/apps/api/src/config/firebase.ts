import admin from 'firebase-admin';
import { env } from './env';

export const firebaseAdmin = admin.initializeApp({
  projectId: env.firebase.projectId || undefined,
});

export const firebaseAuth = admin.auth();
