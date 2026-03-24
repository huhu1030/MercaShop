import { Request } from 'express';
import { expressAuthentication } from '../../src/auth/authentication';

const mockVerifyIdToken = jest.fn();
const mockAuthForTenant = jest.fn(() => ({
  verifyIdToken: mockVerifyIdToken,
}));

jest.mock('../../src/config/firebase', () => ({
  firebaseAuth: {
    tenantManager: () => ({
      authForTenant: mockAuthForTenant,
    }),
  },
}));

function createMockRequest(
  headers: Record<string, string> = {},
  tenant?: { _id: { toString: () => string }; identityPlatformTenantId: string },
): Request {
  const req = {
    headers,
    tenantId: tenant?._id.toString(),
    tenant,
  } as unknown as Request;
  return req;
}

const mockTenant = {
  _id: { toString: () => 'tenant-1' },
  identityPlatformTenantId: 'ip-tenant-abc',
};

describe('expressAuthentication', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns decoded user on valid token', async () => {
    mockVerifyIdToken.mockResolvedValue({
      uid: 'user-1',
      email: 'test@test.com',
      firebase: { tenant: 'ip-tenant-abc' },
    });

    const req = createMockRequest({ authorization: 'Bearer valid-token' }, mockTenant);
    const result = await expressAuthentication(req, 'BearerAuth');

    expect(mockAuthForTenant).toHaveBeenCalledWith('ip-tenant-abc');
    expect(result).toEqual({
      uid: 'user-1',
      email: 'test@test.com',
      tenantId: 'tenant-1',
    });
    expect(req.firebaseUser).toEqual(result);
  });

  it('throws on missing authorization header', async () => {
    const req = createMockRequest({}, mockTenant);
    await expect(expressAuthentication(req, 'BearerAuth')).rejects.toThrow(
      'Missing or invalid authorization header',
    );
  });

  it('throws on malformed authorization header', async () => {
    const req = createMockRequest({ authorization: 'Basic abc' }, mockTenant);
    await expect(expressAuthentication(req, 'BearerAuth')).rejects.toThrow(
      'Missing or invalid authorization header',
    );
  });

  it('throws when tenant is not resolved', async () => {
    const req = createMockRequest({ authorization: 'Bearer valid-token' });
    await expect(expressAuthentication(req, 'BearerAuth')).rejects.toThrow(
      'Tenant not resolved',
    );
  });

  it('throws when identityPlatformTenantId is empty', async () => {
    const badTenant = { _id: { toString: () => 'tenant-1' }, identityPlatformTenantId: '' };
    const req = createMockRequest({ authorization: 'Bearer valid-token' }, badTenant);
    await expect(expressAuthentication(req, 'BearerAuth')).rejects.toThrow(
      'Tenant not configured for Identity Platform',
    );
  });

  it('throws on invalid token', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Token expired'));

    const req = createMockRequest({ authorization: 'Bearer expired-token' }, mockTenant);
    await expect(expressAuthentication(req, 'BearerAuth')).rejects.toThrow();
  });

  it('throws on unknown security scheme', async () => {
    const req = createMockRequest({ authorization: 'Bearer token' }, mockTenant);
    await expect(expressAuthentication(req, 'OAuth2')).rejects.toThrow('Unknown security scheme');
  });
});
