import { Configuration, DefaultApi } from '@mercashop/shared/api-client';
import { auth } from '../config/firebase';

const apiConfiguration = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
  accessToken: async () => {
    const token = await auth.currentUser?.getIdToken();
    return token ?? '';
  },
});

export const api = new DefaultApi(apiConfiguration);
