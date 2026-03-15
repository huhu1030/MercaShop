import { Request, Response, NextFunction } from 'express';
import { tenantResolver } from '../../src/middleware/tenantResolver';
import { TenantModel } from '../../src/models';

jest.mock('../../src/models', () => ({
  TenantModel: {
    findOne: jest.fn(),
    findById: jest.fn(),
  },
}));

function createMockReqRes(headers: Record<string, string> = {}) {
  const req = { headers } as unknown as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('tenantResolver', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resolves tenant from x-tenant-id header', async () => {
    const mockTenant = { _id: 'tenant-123', isActive: true, identityPlatformTenantId: 'ip-abc' };
    (TenantModel.findById as jest.Mock).mockResolvedValue(mockTenant);

    const { req, res, next } = createMockReqRes({ 'x-tenant-id': 'tenant-123' });
    await tenantResolver(req, res, next);

    expect(req.tenantId).toBe('tenant-123');
    expect(req.tenant).toBe(mockTenant);
    expect(next).toHaveBeenCalled();
  });

  it('resolves tenant from Origin header domain lookup', async () => {
    const mockTenant = { _id: { toString: () => 'tenant-456' }, isActive: true, identityPlatformTenantId: 'ip-def' };
    (TenantModel.findOne as jest.Mock).mockResolvedValue(mockTenant);

    const { req, res, next } = createMockReqRes({ origin: 'https://lebon.mercashop.be' });
    await tenantResolver(req, res, next);

    expect(TenantModel.findOne).toHaveBeenCalledWith({
      domains: 'lebon.mercashop.be',
      isActive: true,
    });
    expect(req.tenantId).toBe('tenant-456');
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 when no tenant found', async () => {
    (TenantModel.findOne as jest.Mock).mockResolvedValue(null);

    const { req, res, next } = createMockReqRes();
    await tenantResolver(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Tenant not found or inactive' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when tenant is inactive', async () => {
    (TenantModel.findById as jest.Mock).mockResolvedValue({ isActive: false });

    const { req, res, next } = createMockReqRes({ 'x-tenant-id': 'inactive-id' });
    await tenantResolver(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('uses cache on second call for same domain', async () => {
    const mockTenant = { _id: { toString: () => 'tenant-789' }, isActive: true, identityPlatformTenantId: 'ip-ghi' };
    (TenantModel.findOne as jest.Mock).mockResolvedValue(mockTenant);

    const { req: req1, res: res1, next: next1 } = createMockReqRes({ origin: 'https://cached.test' });
    await tenantResolver(req1, res1, next1);

    const { req: req2, res: res2, next: next2 } = createMockReqRes({ origin: 'https://cached.test' });
    await tenantResolver(req2, res2, next2);

    expect(TenantModel.findOne).toHaveBeenCalledTimes(1);
    expect(next2).toHaveBeenCalled();
  });
});
