import { Request } from 'express';
import { firebaseAuth } from '../config/firebase';

export async function expressAuthentication(
  request: Request,
  securityName: string,
  _scopes?: string[],
): Promise<{ uid: string; email: string; tenantId: string }> {
  if (securityName !== 'BearerAuth') {
    throw new Error('Unknown security scheme');
  }

  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  if (!request.tenant) {
    throw new Error('Tenant not resolved');
  }

  const ipTenantId = request.tenant.identityPlatformTenantId;
  if (!ipTenantId) {
    throw new Error('Tenant not configured for Identity Platform');
  }

  const token = authHeader.split(' ')[1];
  const tenantAuth = firebaseAuth.tenantManager().authForTenant(ipTenantId);
  const decoded = await tenantAuth.verifyIdToken(token);

  const firebaseUser = {
    uid: decoded.uid,
    email: decoded.email ?? '',
    tenantId: request.tenantId ?? '',
  };

  request.firebaseUser = firebaseUser;

  return firebaseUser;
}
