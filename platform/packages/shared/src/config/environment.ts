interface EnvironmentConfig {
  API_URL: string;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] ?? defaultValue;
};

export const environment: EnvironmentConfig = {
  API_URL: getEnvVar('VITE_API_URL'),
  FIREBASE_API_KEY: getEnvVar('VITE_FIREBASE_API_KEY'),
  FIREBASE_AUTH_DOMAIN: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  FIREBASE_PROJECT_ID: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  FIREBASE_STORAGE_BUCKET: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  FIREBASE_MESSAGING_SENDER_ID: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  FIREBASE_APP_ID: getEnvVar('VITE_FIREBASE_APP_ID'),
};
