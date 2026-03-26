import type { ITenantBranding } from '@mercashop/shared';

export interface CreateTenantBody {
  /** @minLength 1 @maxLength 100 */
  name: string;
  /** @minLength 1 @maxLength 50 */
  slug: string;
  domains: string[];
  branding: ITenantBranding;
  contact: {
    /** @minLength 1 */
    firstName: string;
    /** @minLength 1 */
    lastName: string;
    /** @format email */
    email: string;
    phone?: string;
  };
}
