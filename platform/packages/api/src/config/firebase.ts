import admin from 'firebase-admin';
import { env } from './env';

export const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.firebase.projectId,
    privateKey: env.firebase.privateKey,
    clientEmail: env.firebase.clientEmail,
  }),
  storageBucket: env.firebase.storageBucket,
});

export const cloudStorage = admin.storage();
export const firebaseAuth = admin.auth();
