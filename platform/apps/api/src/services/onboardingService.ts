import { z } from 'zod';
import { UserRole } from '@mercashop/shared';
import { firebaseAuth } from '../config/firebase';
import { EstablishmentModel, TenantModel, UserModel } from '../models';
import { type EstablishmentDocument } from '../models/Establishment';
import { type TenantDocument } from '../models/Tenant';
import { type UserDocument } from '../models/User';
import { createIdentityPlatformTenant, deleteIdentityPlatformTenant } from './identityPlatformService';

const requiredString = z.string().trim().min(1);

const onboardTenantInputSchema = z.object({
  tenant: z.object({
    name: requiredString,
    slug: requiredString,
    domains: z.array(requiredString).min(1),
    branding: z.object({
      logo: z.string().trim(),
      primaryColor: requiredString,
      appName: requiredString,
    }),
    contact: z.object({
      firstName: requiredString,
      lastName: requiredString,
      email: z.string().trim().email(),
      phone: z.string().trim(),
    }),
  }),
  establishment: z.object({
    name: requiredString,
    category: requiredString,
    phone: z.string().trim(),
    slug: requiredString,
    address: z.object({
      street: requiredString,
      number: requiredString,
      zipCode: requiredString,
      municipality: requiredString,
      city: requiredString,
      country: requiredString,
    }),
    location: z.object({
      latitude: z.number().finite(),
      longitude: z.number().finite(),
    }),
  }),
  admin: z.object({
    firstName: requiredString,
    lastName: requiredString,
    email: z.string().trim().email(),
    phone: z.string().trim(),
    password: z.string().min(6),
  }),
});

export type OnboardTenantInput = z.infer<typeof onboardTenantInputSchema>;

type OnboardingStepKey = 'identity-platform-tenant' | 'mongodb-tenant' | 'firebase-user' | 'mongodb-user' | 'mongodb-establishment';

type RollbackStepKey = 'mongodb-establishment' | 'mongodb-user' | 'firebase-user' | 'mongodb-tenant' | 'identity-platform-tenant';

export interface OnboardingLogger {
  stepStarted?(stepNumber: number, totalSteps: number, label: string): void;
  stepSucceeded?(step: OnboardingStepKey, details?: string): void;
  stepFailed?(step: OnboardingStepKey, error: unknown): void;
  rollbackStarted?(): void;
  rollbackStepStarted?(step: RollbackStepKey, label: string): void;
  rollbackStepSucceeded?(step: RollbackStepKey): void;
  rollbackStepFailed?(step: RollbackStepKey, error: unknown): void;
}

export interface OnboardingResult {
  tenant: TenantDocument;
  adminUser: UserDocument;
  establishment: EstablishmentDocument;
  ipTenantId: string;
  firebaseUid: string;
}

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`).join('\n');
}

function normalizeInput(input: OnboardTenantInput): OnboardTenantInput {
  return {
    tenant: {
      ...input.tenant,
      name: input.tenant.name.trim(),
      slug: input.tenant.slug.trim().toLowerCase(),
      domains: input.tenant.domains.map((domain) => domain.trim().toLowerCase()),
      branding: {
        ...input.tenant.branding,
        logo: input.tenant.branding.logo.trim(),
        primaryColor: input.tenant.branding.primaryColor.trim(),
        appName: input.tenant.branding.appName.trim(),
      },
      contact: {
        ...input.tenant.contact,
        firstName: input.tenant.contact.firstName.trim(),
        lastName: input.tenant.contact.lastName.trim(),
        email: input.tenant.contact.email.trim().toLowerCase(),
        phone: input.tenant.contact.phone.trim(),
      },
    },
    establishment: {
      ...input.establishment,
      name: input.establishment.name.trim(),
      category: input.establishment.category.trim(),
      phone: input.establishment.phone.trim(),
      slug: input.establishment.slug.trim().toLowerCase(),
      address: {
        street: input.establishment.address.street.trim(),
        number: input.establishment.address.number.trim(),
        zipCode: input.establishment.address.zipCode.trim(),
        municipality: input.establishment.address.municipality.trim(),
        city: input.establishment.address.city.trim(),
        country: input.establishment.address.country.trim(),
      },
      location: input.establishment.location,
    },
    admin: {
      ...input.admin,
      firstName: input.admin.firstName.trim(),
      lastName: input.admin.lastName.trim(),
      email: input.admin.email.trim().toLowerCase(),
      phone: input.admin.phone.trim(),
    },
  };
}

export function parseOnboardTenantInput(rawInput: unknown): OnboardTenantInput {
  const parsed = onboardTenantInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error(`Invalid onboarding config:\n${formatZodError(parsed.error)}`);
  }

  return normalizeInput(parsed.data);
}

export async function validateOnboardTenantInput(input: OnboardTenantInput): Promise<void> {
  const existingTenantBySlug = await TenantModel.findOne({ slug: input.tenant.slug }).lean();
  if (existingTenantBySlug) {
    throw new Error(`Tenant slug "${input.tenant.slug}" already exists.`);
  }

  const existingTenantByDomain = await TenantModel.findOne({
    domains: { $in: input.tenant.domains },
  }).lean();
  if (existingTenantByDomain) {
    const overlappingDomains = existingTenantByDomain.domains.filter((domain) => input.tenant.domains.includes(domain));
    throw new Error(`Tenant domains already in use: ${overlappingDomains.join(', ') || input.tenant.domains.join(', ')}.`);
  }

  const existingAdminUser = await UserModel.findOne({ email: input.admin.email }).lean();
  if (existingAdminUser) {
    throw new Error(`Admin email "${input.admin.email}" already exists in MongoDB.`);
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return String(error);
}

export async function onboardTenant(input: OnboardTenantInput, logger?: OnboardingLogger): Promise<OnboardingResult> {
  let ipTenantId: string | undefined;
  let tenant: TenantDocument | undefined;
  let firebaseUid: string | undefined;
  let adminUser: UserDocument | undefined;
  let establishment: EstablishmentDocument | undefined;

  async function rollback(): Promise<void> {
    logger?.rollbackStarted?.();

    if (establishment) {
      logger?.rollbackStepStarted?.('mongodb-establishment', 'Deleting MongoDB establishment');
      try {
        await EstablishmentModel.findByIdAndDelete(establishment._id);
        logger?.rollbackStepSucceeded?.('mongodb-establishment');
      } catch (error) {
        logger?.rollbackStepFailed?.('mongodb-establishment', error);
      }
    }

    if (adminUser) {
      logger?.rollbackStepStarted?.('mongodb-user', 'Deleting MongoDB user');
      try {
        await UserModel.findByIdAndDelete(adminUser._id);
        logger?.rollbackStepSucceeded?.('mongodb-user');
      } catch (error) {
        logger?.rollbackStepFailed?.('mongodb-user', error);
      }
    }

    if (firebaseUid && ipTenantId) {
      logger?.rollbackStepStarted?.('firebase-user', 'Deleting Firebase user');
      try {
        await firebaseAuth.tenantManager().authForTenant(ipTenantId).deleteUser(firebaseUid);
        logger?.rollbackStepSucceeded?.('firebase-user');
      } catch (error) {
        logger?.rollbackStepFailed?.('firebase-user', error);
      }
    }

    if (tenant) {
      logger?.rollbackStepStarted?.('mongodb-tenant', 'Deleting MongoDB tenant');
      try {
        await TenantModel.findByIdAndDelete(tenant._id);
        logger?.rollbackStepSucceeded?.('mongodb-tenant');
      } catch (error) {
        logger?.rollbackStepFailed?.('mongodb-tenant', error);
      }
    }

    if (ipTenantId) {
      logger?.rollbackStepStarted?.('identity-platform-tenant', 'Deleting IP tenant');
      try {
        await deleteIdentityPlatformTenant(ipTenantId);
        logger?.rollbackStepSucceeded?.('identity-platform-tenant');
      } catch (error) {
        logger?.rollbackStepFailed?.('identity-platform-tenant', error);
      }
    }
  }

  try {
    logger?.stepStarted?.(1, 5, 'Creating Identity Platform tenant');
    ipTenantId = await createIdentityPlatformTenant(input.tenant.name);
    logger?.stepSucceeded?.('identity-platform-tenant', `ipTenantId: ${ipTenantId}`);

    logger?.stepStarted?.(2, 5, 'Creating MongoDB tenant');
    tenant = await TenantModel.create({
      ...input.tenant,
      isActive: true,
      identityPlatformTenantId: ipTenantId,
    });
    logger?.stepSucceeded?.('mongodb-tenant', `id: ${tenant._id.toString()}`);

    logger?.stepStarted?.(3, 5, 'Creating Firebase user');
    const firebaseUser = await firebaseAuth
      .tenantManager()
      .authForTenant(ipTenantId)
      .createUser({
        email: input.admin.email,
        password: input.admin.password,
        displayName: `${input.admin.firstName} ${input.admin.lastName}`.trim(),
        phoneNumber: input.admin.phone || undefined,
        emailVerified: true,
      });
    firebaseUid = firebaseUser.uid;
    logger?.stepSucceeded?.('firebase-user', `uid: ${firebaseUid}`);

    logger?.stepStarted?.(4, 5, 'Creating MongoDB user (ADMIN)');
    adminUser = await UserModel.create({
      tenantId: tenant._id.toString(),
      firebaseUid,
      firstName: input.admin.firstName,
      lastName: input.admin.lastName,
      email: input.admin.email,
      phone: input.admin.phone,
      role: UserRole.ADMIN,
      isVerified: true,
    });
    logger?.stepSucceeded?.('mongodb-user', `id: ${adminUser._id.toString()}`);

    logger?.stepStarted?.(5, 5, 'Creating MongoDB establishment');
    establishment = await EstablishmentModel.create({
      tenantId: tenant._id.toString(),
      name: input.establishment.name,
      category: input.establishment.category,
      phone: input.establishment.phone,
      slug: input.establishment.slug,
      address: input.establishment.address,
      ownerId: firebaseUid,
      location: input.establishment.location,
    });
    logger?.stepSucceeded?.('mongodb-establishment', `id: ${establishment._id.toString()}`);

    return {
      tenant,
      adminUser,
      establishment,
      ipTenantId,
      firebaseUid,
    };
  } catch (error) {
    const failedStep = (() => {
      if (!ipTenantId) return 'identity-platform-tenant';
      if (!tenant) return 'mongodb-tenant';
      if (!firebaseUid) return 'firebase-user';
      if (!adminUser) return 'mongodb-user';
      return 'mongodb-establishment';
    })();

    logger?.stepFailed?.(failedStep, error);
    await rollback();
    throw new Error(describeError(error));
  }
}
