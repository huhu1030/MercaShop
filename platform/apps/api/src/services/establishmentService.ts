import { EstablishmentStatus, UserRole } from '@mercashop/shared';
import { EstablishmentModel } from '../models';
import * as userService from './userService';

export async function findEstablishments(tenantId: string) {
  return EstablishmentModel.find({ tenantId });
}

export async function findEstablishmentById(id: string, tenantId: string) {
  return EstablishmentModel.findOne({ _id: id, tenantId });
}

export async function updateEstablishmentStatus(
  establishmentId: string,
  tenantId: string,
  status: string,
  userId: string,
): Promise<import('../models/Establishment').EstablishmentDocument | null> {
  if (!Object.values(EstablishmentStatus).includes(status as EstablishmentStatus)) {
    throw new Error('Invalid establishment status');
  }

  const establishment = await EstablishmentModel.findOne({ _id: establishmentId, tenantId });
  if (!establishment) {
    return null;
  }

  const user = await userService.findUserByFirebaseUid(tenantId, userId);
  const isOwner = establishment.ownerId === userId;
  const isAdmin = user?.role === UserRole.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new Error('Not authorized to update this establishment');
  }

  establishment.status = status as EstablishmentStatus;
  await establishment.save();
  return establishment;
}
