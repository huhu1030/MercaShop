import { handleCardPayment, handleCashPayment, handleWebhook } from '../../src/services/paymentService';

jest.mock('../../src/services/mollieService', () => ({
  createPayment: jest.fn().mockResolvedValue({
    id: 'tr_mock123',
    _links: { checkout: { href: 'https://checkout.mollie.com/mock' } },
  }),
  fetchPaymentById: jest.fn(),
}));

jest.mock('../../src/services/mailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  mailTemplates: { orderConfirmation: 'orderConfirmation' },
}));

jest.mock('../../src/services/socketServer', () => ({
  __esModule: true,
  default: { getInstance: () => ({ sendOrders: jest.fn() }) },
}));

jest.mock('../../src/models', () => ({
  OrderModel: {
    findByIdAndUpdate: jest.fn().mockResolvedValue({}),
    findOne: jest.fn(),
  },
  UserModel: { findById: jest.fn() },
  ProductModel: { findByIdAndUpdate: jest.fn().mockResolvedValue({}) },
  EstablishmentModel: { findOne: jest.fn().mockResolvedValue({ _id: 'est-1' }) },
}));

import * as mollieService from '../../src/services/mollieService';
import { OrderModel, UserModel } from '../../src/models';

const mockOrder = {
  _id: 'order-1',
  userId: 'user-1',
  establishmentId: 'est-1',
  total: 25.50,
  orderLines: [
    { item: { _id: 'prod-1', name: 'Pizza', quantity: 2, price: 12.75 } },
  ],
};

describe('paymentService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('handleCardPayment', () => {
    it('creates Mollie payment and returns checkout URL', async () => {
      const result = await handleCardPayment('user@test.com', mockOrder);
      expect(result.checkoutUrl).toBe('https://checkout.mollie.com/mock');
    });
  });

  describe('handleCashPayment', () => {
    it('marks order as unpaid and decrements product quantities', async () => {
      await handleCashPayment('tenant-1', 'user@test.com', mockOrder);
      expect(OrderModel.findByIdAndUpdate).toHaveBeenCalledWith('order-1', { isPaid: false });
    });
  });

  describe('handleWebhook', () => {
    it('marks order as paid when Mollie status is paid', async () => {
      (mollieService.fetchPaymentById as jest.Mock).mockResolvedValue({ status: 'paid' });
      (OrderModel.findOne as jest.Mock).mockResolvedValue({ ...mockOrder, _id: { toString: () => 'order-1' } });
      (UserModel.findById as jest.Mock).mockResolvedValue({ email: 'user@test.com' });

      const result = await handleWebhook('tr_mock123');
      expect(result.status).toBe('paid');
      expect(OrderModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('throws when order not found for payment', async () => {
      (mollieService.fetchPaymentById as jest.Mock).mockResolvedValue({ status: 'paid' });
      (OrderModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(handleWebhook('tr_unknown')).rejects.toThrow('Order not found for payment');
    });
  });
});
