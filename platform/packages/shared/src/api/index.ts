// Re-export everything from the generated API client
export * from '../apis/api';

// Centralized API client factory
export { initApiClient, getApiAxiosInstance, createApiConfiguration } from './api-client-factory';
export {
  getEstablishmentApi,
  getOrderApi,
  getPaymentApi,
  getProductApi,
  getTenantApi,
  getUploadApi,
  getUserApi,
  getWebhookApi,
  resetApiClients,
} from './clients';
