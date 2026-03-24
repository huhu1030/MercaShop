import { publicService } from '../../src/services/publicService';
import { EstablishmentModel } from '../../src/models/Establishment';
import { ProductModel } from '../../src/models/Product';

jest.mock('../../src/models/Establishment');
jest.mock('../../src/models/Product');

describe('publicService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('getEstablishments', () => {
    it('returns public fields only', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439011',
        tenantId: 'tenant-1',
        name: 'Main Store',
        slug: 'main-store',
        logo: 'logo.png',
        banner: 'banner.png',
        status: 'OPEN',
        openingHours: '9-17',
        address: { street: 'Main St', number: '1', zipCode: '1000', municipality: 'Brussels', city: 'Brussels', country: 'BE' },
        paymentMethods: ['CARD', 'CASH'],
        description: 'A store',
        ownerId: 'owner-1',
        products: ['prod-1'],
        phone: '+32123456',
        category: 'food',
      };

      const { ownerId, products, phone, tenantId, category, ...publicFields } = mockDoc;
      (EstablishmentModel.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([publicFields]),
        }),
      });

      const result = await publicService.getEstablishments('tenant-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('name', 'Main Store');
      expect(result[0]).toHaveProperty('slug', 'main-store');
      expect(result[0]).toHaveProperty('paymentMethods');
      expect(result[0]).not.toHaveProperty('ownerId');
      expect(result[0]).not.toHaveProperty('products');
      expect(result[0]).not.toHaveProperty('phone');
      expect(result[0]).not.toHaveProperty('tenantId');
    });
  });

  describe('getProductsByEstablishment', () => {
    it('returns public product fields only', async () => {
      const mockDoc = {
        _id: '507f1f77bcf86cd799439012',
        tenantId: 'tenant-1',
        establishmentId: 'est-1',
        name: 'Widget',
        description: 'A widget',
        price: 9.99,
        photo: 'widget.png',
        category: 'electronics',
        quantity: 50,
        serialNumber: 'SN123',
        location: { latitude: 50, longitude: 4 },
      };

      const { tenantId, establishmentId, quantity, serialNumber, location, ...publicFields } = mockDoc;
      (ProductModel.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([publicFields]),
        }),
      });

      const result = await publicService.getProductsByEstablishment('tenant-1', 'est-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('name', 'Widget');
      expect(result[0]).toHaveProperty('price', 9.99);
      expect(result[0]).not.toHaveProperty('quantity');
      expect(result[0]).not.toHaveProperty('serialNumber');
      expect(result[0]).not.toHaveProperty('location');
      expect(result[0]).not.toHaveProperty('tenantId');
      expect(result[0]).not.toHaveProperty('establishmentId');
    });
  });
});
