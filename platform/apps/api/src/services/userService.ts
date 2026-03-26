import { UserModel } from '../models';
import { firebaseAuth } from '../config/firebase';
import type { CreateUserBody, UpdateUserBody } from '../dtos/user.dto';

export async function findUserByFirebaseUid(tenantId: string, firebaseUid: string) {
  return UserModel.findOne({ tenantId, firebaseUid });
}

export async function createUser(tenantId: string, firebaseUid: string, email: string, body: CreateUserBody) {
  return UserModel.create({
    tenantId,
    firebaseUid,
    email,
    ...body,
    phone: body.phone ?? '',
  });
}

export async function updateUser(tenantId: string, firebaseUid: string, data: UpdateUserBody) {
  return UserModel.findOneAndUpdate({ tenantId, firebaseUid }, data, { new: true });
}

export async function deleteUser(tenantId: string, firebaseUid: string, ipTenantId: string) {
  await UserModel.findOneAndDelete({ tenantId, firebaseUid });
  await firebaseAuth.tenantManager().authForTenant(ipTenantId).deleteUser(firebaseUid);
}
