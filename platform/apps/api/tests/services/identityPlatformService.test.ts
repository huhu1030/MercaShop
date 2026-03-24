const mockCreateTenant = jest.fn();
const mockDeleteTenant = jest.fn();
const mockGetAccessToken = jest.fn();

jest.mock('../../src/config/firebase', () => ({
  firebaseAuth: {
    tenantManager: () => ({
      createTenant: (...args: unknown[]) => mockCreateTenant(...args),
      deleteTenant: (...args: unknown[]) => mockDeleteTenant(...args),
    }),
  },
}));

jest.mock('../../src/config/env', () => ({
  env: {
    firebase: { projectId: 'test-project' },
    oauth: {
      google: { clientId: 'g-id', clientSecret: 'g-secret' },
      apple: { clientId: 'a-id', clientSecret: 'a-secret' },
      facebook: { clientId: 'f-id', clientSecret: 'f-secret' },
    },
  },
}));

jest.mock('google-auth-library', () => ({
  GoogleAuth: jest.fn().mockImplementation(() => ({
    getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
  })),
}));

// Mock global fetch
global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as jest.Mock;

import { createIdentityPlatformTenant, deleteIdentityPlatformTenant } from '../../src/services/identityPlatformService';

describe('identityPlatformService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createIdentityPlatformTenant', () => {
    it('creates an IP tenant and configures OAuth providers', async () => {
      mockCreateTenant.mockResolvedValue({ tenantId: 'ip-tenant-123' });
      mockGetAccessToken.mockResolvedValue('mock-token');

      const result = await createIdentityPlatformTenant('My Restaurant');

      expect(mockCreateTenant).toHaveBeenCalledWith({
        displayName: 'My Restaurant',
        emailSignInConfig: { enabled: true, passwordRequired: true },
      });
      expect(result).toBe('ip-tenant-123');
      // 3 providers configured
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('throws if IP tenant creation fails', async () => {
      mockCreateTenant.mockRejectedValue(new Error('quota exceeded'));

      await expect(createIdentityPlatformTenant('Bad Tenant')).rejects.toThrow('quota exceeded');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('cleans up IP tenant if OAuth provider configuration fails', async () => {
      mockCreateTenant.mockResolvedValue({ tenantId: 'ip-tenant-456' });
      mockGetAccessToken.mockResolvedValue('mock-token');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'bad config' }),
      });
      mockDeleteTenant.mockResolvedValue(undefined);

      await expect(createIdentityPlatformTenant('Fail OAuth')).rejects.toThrow('Failed to configure google.com');
      expect(mockDeleteTenant).toHaveBeenCalledWith('ip-tenant-456');
    });
  });

  describe('deleteIdentityPlatformTenant', () => {
    it('deletes an IP tenant', async () => {
      mockDeleteTenant.mockResolvedValue(undefined);

      await deleteIdentityPlatformTenant('ip-tenant-123');

      expect(mockDeleteTenant).toHaveBeenCalledWith('ip-tenant-123');
    });
  });
});
