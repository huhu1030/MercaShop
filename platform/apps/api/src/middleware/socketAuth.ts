import type { Socket } from 'socket.io';
import { firebaseAuth } from '../config/firebase';
import { TenantModel } from '../models';

export async function socketAuth(socket: Socket, next: (err?: Error) => void): Promise<void> {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));

    const decoded = await firebaseAuth.verifyIdToken(token);
    const ipTenantId = decoded.firebase?.tenant as string | undefined;
    if (!ipTenantId) return next(new Error('Token missing tenant claim'));

    const tenant = await TenantModel.findOne({ identityPlatformTenantId: ipTenantId, isActive: true }).lean();
    if (!tenant) return next(new Error('Tenant not found'));

    socket.data.uid = decoded.uid;
    socket.data.tenantId = String(tenant._id);

    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
