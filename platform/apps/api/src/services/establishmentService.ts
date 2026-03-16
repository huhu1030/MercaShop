import { EstablishmentModel } from '../models';

export async function findEstablishments(tenantId: string) {
  return EstablishmentModel.find({ tenantId });
}

export async function findEstablishmentById(id: string, tenantId: string) {
  return EstablishmentModel.findOne({ _id: id, tenantId });
}

export async function updateEstablishmentStatus(establishmentId: string, tenantId: string, status: string) {
  return EstablishmentModel.findOneAndUpdate(
    { _id: establishmentId, tenantId },
    { status },
    { new: true },
  );
}
