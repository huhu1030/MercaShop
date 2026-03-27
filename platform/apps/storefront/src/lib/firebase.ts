import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { environment } from '@mercashop/shared/config/environment';

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;

const firebaseConfig = {
  apiKey: environment.FIREBASE_API_KEY,
  authDomain: environment.FIREBASE_AUTH_DOMAIN,
  projectId: environment.FIREBASE_PROJECT_ID,
  storageBucket: environment.FIREBASE_STORAGE_BUCKET,
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
