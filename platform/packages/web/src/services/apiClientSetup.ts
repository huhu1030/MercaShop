import { Configuration } from '@mercashop/shared/generated/api-client';
import { auth } from '../config/firebase';

export function createApiConfiguration(): Configuration {
  return new Configuration({
    basePath: import.meta.env.VITE_API_URL,
    accessToken: async () => {
      const token = await auth.currentUser?.getIdToken();
      return token ?? '';
    },
  });
}
