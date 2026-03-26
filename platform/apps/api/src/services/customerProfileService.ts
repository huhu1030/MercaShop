import { CustomerProfileModel, type CustomerProfileDocument } from '../models/CustomerProfile';
import type { ICustomerProfile } from '@mercashop/shared';
import type { UpdateCustomerProfileBody } from '../dtos/customer-profile.dto';

function toProfileResponse(doc: CustomerProfileDocument): ICustomerProfile {
  return {
    billingInformation: {
      name: doc.billingInformation.name,
      email: doc.billingInformation.email,
      phone: doc.billingInformation.phone,
      vatNumber: doc.billingInformation.vatNumber,
    },
    deliveryAddress: {
      street: doc.deliveryAddress.street,
      number: doc.deliveryAddress.number,
      zipCode: doc.deliveryAddress.zipCode,
      city: doc.deliveryAddress.city,
      municipality: doc.deliveryAddress.municipality,
      comment: doc.deliveryAddress.comment,
    },
  };
}

export async function getOrCreateProfile(tenantId: string, userId: string): Promise<ICustomerProfile> {
  let profile = await CustomerProfileModel.findOne({ tenantId, userId });
  if (!profile) {
    profile = await CustomerProfileModel.create({ tenantId, userId });
  }
  return toProfileResponse(profile);
}

export async function updateProfile(tenantId: string, userId: string, data: UpdateCustomerProfileBody): Promise<ICustomerProfile> {
  const updateFields: Record<string, string> = {};

  if (data.billingInformation) {
    for (const [key, value] of Object.entries(data.billingInformation)) {
      if (value !== undefined) {
        updateFields[`billingInformation.${key}`] = value;
      }
    }
  }

  if (data.deliveryAddress) {
    for (const [key, value] of Object.entries(data.deliveryAddress)) {
      if (value !== undefined) {
        updateFields[`deliveryAddress.${key}`] = value;
      }
    }
  }

  const profile = await CustomerProfileModel.findOneAndUpdate(
    { tenantId, userId },
    { $set: updateFields },
    { new: true, upsert: true },
  );

  return toProfileResponse(profile);
}
