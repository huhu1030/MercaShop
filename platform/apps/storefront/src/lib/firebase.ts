import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};

export function getFirebaseAuth(): Auth {
  if (!auth) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export function initFirebaseWithTenant(tenantId: string): Auth {
  const authInstance = getFirebaseAuth();
  authInstance.tenantId = tenantId;
  return authInstance;
}
