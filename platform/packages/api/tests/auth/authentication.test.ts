import { Request } from 'express';
import { expressAuthentication } from '../../src/auth/authentication';

jest.mock('../../src/config/firebase', () => ({
  firebaseAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import { firebaseAuth } from '../../src/config/firebase';

function createMockRequest(headers: Record<string, string> = {}, tenantId?: string): Request {
  const req = { headers, tenantId } as unknown as Request;
  return req;
}

describe('expressAuthentication', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns decoded user on valid token', async () => {
    (firebaseAuth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-1',
      email: 'test@test.com',
      tenantId: 'tenant-1',
    });

    const req = createMockRequest({ authorization: 'Bearer valid-token' }, 'tenant-1');
    const result = await expressAuthentication(req, 'BearerAuth');

    expect(result).toEqual({
      uid: 'user-1',
      email: 'test@test.com',
      tenantId: 'tenant-1',
    });
  });

  it('throws on missing authorization header', async () => {
    const req = createMockRequest({});
    await expect(expressAuthentication(req, 'BearerAuth')).rejects.toThrow(
      'Missing or invalid authorization header',
    );
  });

  it('throws on malformed authorization header', async () => {
    const req = createMockRequest({ authorization: 'Basic abc' });
    await expect(expressAuthentication(req, 'BearerAuth')).rejects.toThrow(
      'Missing or invalid authorization header',
    );
  });

  it('throws on tenant mismatch', async () => {
    (firebaseAuth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'user-1',
      email: 'test@test.com',
      tenantId: 'tenant-A',
    });

    const req = createMockRequest({ authorization: 'Bearer valid-token' }, 'tenant-B');
    await expect(expressAuthentication(req, 'BearerAuth')).rejects.toThrow('Tenant mismatch');
  });

  it('throws on invalid token', async () => {
    (firebaseAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Token expired'));

    const req = createMockRequest({ authorization: 'Bearer expired-token' });
    await expect(expressAuthentication(req, 'BearerAuth')).rejects.toThrow();
  });

  it('throws on unknown security scheme', async () => {
    const req = createMockRequest({ authorization: 'Bearer token' });
    await expect(expressAuthentication(req, 'OAuth2')).rejects.toThrow('Unknown security scheme');
  });
});
