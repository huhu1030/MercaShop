declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenant?: import('../models/Tenant').TenantDocument;
      firebaseUser?: {
        uid: string;
        email: string;
        tenantId: string;
      };
    }
  }
}
export {};
