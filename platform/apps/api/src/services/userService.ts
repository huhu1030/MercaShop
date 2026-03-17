import { UserModel } from '../models';
import { firebaseAuth } from '../config/firebase';

interface CreateUserData {
  tenantId: string;
  firebaseUid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function findUserByFirebaseUid(tenantId: string, firebaseUid: string) {
  return UserModel.findOne({ tenantId, firebaseUid });
}

export async function createUser(data: CreateUserData) {
  return UserModel.create(data);
}

export async function updateUser(tenantId: string, firebaseUid: string, data: UpdateUserData) {
  return UserModel.findOneAndUpdate({ tenantId, firebaseUid }, data, { new: true });
}

export async function deleteUser(tenantId: string, firebaseUid: string, ipTenantId: string) {
  await UserModel.findOneAndDelete({ tenantId, firebaseUid });
  await firebaseAuth.tenantManager().authForTenant(ipTenantId).deleteUser(firebaseUid);
}
