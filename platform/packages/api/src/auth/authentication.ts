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

  const token = authHeader.split(' ')[1];
  const decoded = await firebaseAuth.verifyIdToken(token);

  if (request.tenantId && decoded.tenantId && decoded.tenantId !== request.tenantId) {
    throw new Error('Tenant mismatch');
  }

  return {
    uid: decoded.uid,
    email: decoded.email ?? '',
    tenantId: (decoded.tenantId as string) ?? request.tenantId ?? '',
  };
}
