import { auth } from '../config/firebase';

// TODO: Import Configuration from @mercashop/shared/generated/api-client once subpath exports are configured
interface ApiConfiguration {
  basePath: string;
  accessToken: () => Promise<string>;
}

export function createApiConfiguration(): ApiConfiguration {
  return {
    basePath: import.meta.env.VITE_API_URL,
    accessToken: async () => {
      const token = await auth.currentUser?.getIdToken();
      return token ?? '';
    },
  };
}
