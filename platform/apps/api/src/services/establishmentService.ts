import { EstablishmentStatus } from '@mercashop/shared';
import { EstablishmentModel } from '../models';

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

  if (establishment.ownerId !== userId) {
    throw new Error('Not authorized to update this establishment');
  }

  establishment.status = status as EstablishmentStatus;
  await establishment.save();
  return establishment;
}
