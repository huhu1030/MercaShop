import type { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import axios from 'axios';
import { Configuration } from '../apis/api/configuration';

interface ApiClientConfig {
  getAccessToken: () => Promise<string | null>;
  forceRefreshToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  basePath: string;
}

let config: ApiClientConfig | null = null;
let axiosInstance: AxiosInstance | null = null;
let refreshPromise: Promise<string | null> | null = null;

function getConfig(): ApiClientConfig {
  if (!config) {
    throw new Error('API client not initialized. Call initApiClient() before using any API client.');
  }
  return config;
}

export function initApiClient(clientConfig: ApiClientConfig): void {
  config = clientConfig;
  axiosInstance = null;
  refreshPromise = null;
}

export function getApiAxiosInstance(): AxiosInstance {
  const cfg = getConfig();

  if (axiosInstance) {
    return axiosInstance;
  }

  axiosInstance = axios.create({ baseURL: cfg.basePath });
  const instance = axiosInstance;

  instance.interceptors.request.use(async (requestConfig) => {
    try {
      const token = await cfg.getAccessToken();
      const headers = (requestConfig.headers ?? {}) as AxiosRequestHeaders;

      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      } else {
        delete (headers as Record<string, string>)['Authorization'];
      }

      if (!(headers as Record<string, string>)['Content-Type']) {
        (headers as Record<string, string>)['Content-Type'] = 'application/json';
      }

      requestConfig.headers = headers;
    } catch {
      // If getAccessToken fails, proceed without auth — server will return 401
    }
    return requestConfig;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalConfig = error.config as (AxiosRequestConfig & { _retry401?: boolean }) | undefined;
      const status = error.response?.status;

      if (!originalConfig || status !== 401) {
        return Promise.reject(error);
      }

      if (originalConfig._retry401) {
        await cfg.signOut().catch(() => {});
        return Promise.reject(error);
      }

      originalConfig._retry401 = true;

      try {
        if (!refreshPromise) {
          refreshPromise = cfg.forceRefreshToken().finally(() => {
            refreshPromise = null;
          });
        }

        const refreshedToken = await refreshPromise;

        if (!refreshedToken) {
          await cfg.signOut().catch(() => {});
          return Promise.reject(error);
        }

        const headers = (originalConfig.headers ?? {}) as AxiosRequestHeaders;
        (headers as Record<string, string>)['Authorization'] = `Bearer ${refreshedToken}`;
        originalConfig.headers = headers;

        return instance.request(originalConfig);
      } catch {
        await cfg.signOut().catch(() => {});
        return Promise.reject(error);
      }
    },
  );

  return axiosInstance;
}

export function createApiConfiguration(): Configuration {
  const cfg = getConfig();
  return new Configuration({ basePath: cfg.basePath });
}
