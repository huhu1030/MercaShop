import { handleCardPayment, handleCashPayment, handleWebhook } from '../../src/services/paymentService';

jest.mock('../../src/services/mollieService', () => ({
  createPayment: jest.fn().mockResolvedValue({
    id: 'tr_mock123',
    _links: { checkout: { href: 'https://checkout.mollie.com/mock' } },
  }),
  fetchPaymentById: jest.fn(),
}));

jest.mock('../../src/services/orderService', () => ({
  linkMolliePayment: jest.fn().mockResolvedValue(undefined),
  markPaidAndDecrementStock: jest.fn().mockResolvedValue(undefined),
  markUnpaidAndDecrementStock: jest.fn().mockResolvedValue(undefined),
  findByMolliePaymentId: jest.fn(),
  notifyEstablishment: jest.fn().mockResolvedValue(undefined),
  notifyRealtime: jest.fn(),
}));

jest.mock('../../src/services/notificationService', () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
  sendOrderConfirmationToUser: jest.fn().mockResolvedValue(undefined),
}));

import * as mollieService from '../../src/services/mollieService';
import * as orderService from '../../src/services/orderService';
import * as notificationService from '../../src/services/notificationService';

const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
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

    it('links mollie payment to order', async () => {
      await handleCardPayment('user@test.com', mockOrder);
      expect(orderService.linkMolliePayment).toHaveBeenCalledWith(mockOrder._id, 'tr_mock123');
    });

    it('does not send a confirmation email', async () => {
      await handleCardPayment('user@test.com', mockOrder);
      expect(notificationService.sendOrderConfirmation).not.toHaveBeenCalled();
      expect(notificationService.sendOrderConfirmationToUser).not.toHaveBeenCalled();
    });
  });

  describe('handleCashPayment', () => {
    it('marks order unpaid, decrements stock, notifies and sends email', async () => {
      await handleCashPayment('tenant-1', 'user@test.com', mockOrder);

      expect(orderService.markUnpaidAndDecrementStock).toHaveBeenCalledWith(mockOrder);
      expect(orderService.notifyEstablishment).toHaveBeenCalledWith('tenant-1', 'est-1', mockOrder);
      expect(notificationService.sendOrderConfirmation).toHaveBeenCalledWith('user@test.com', mockOrder);
    });
  });

  describe('handleWebhook', () => {
    it('marks order as paid and notifies when Mollie status is paid', async () => {
      (mollieService.fetchPaymentById as jest.Mock).mockResolvedValue({ status: 'paid' });
      (orderService.findByMolliePaymentId as jest.Mock).mockResolvedValue(mockOrder);

      const result = await handleWebhook('tr_mock123');

      expect(result.status).toBe('paid');
      expect(orderService.markPaidAndDecrementStock).toHaveBeenCalledWith(mockOrder);
      expect(orderService.notifyRealtime).toHaveBeenCalledWith(mockOrder);
      expect(notificationService.sendOrderConfirmationToUser).toHaveBeenCalledWith('user-1', mockOrder);
    });

    it('does nothing extra for non-paid status', async () => {
      (mollieService.fetchPaymentById as jest.Mock).mockResolvedValue({ status: 'open' });
      (orderService.findByMolliePaymentId as jest.Mock).mockResolvedValue(mockOrder);

      const result = await handleWebhook('tr_mock123');

      expect(result.status).toBe('open');
      expect(orderService.markPaidAndDecrementStock).not.toHaveBeenCalled();
      expect(notificationService.sendOrderConfirmationToUser).not.toHaveBeenCalled();
    });

    it('throws when order not found for payment', async () => {
      (mollieService.fetchPaymentById as jest.Mock).mockResolvedValue({ status: 'paid' });
      (orderService.findByMolliePaymentId as jest.Mock).mockResolvedValue(null);

      await expect(handleWebhook('tr_unknown')).rejects.toThrow('Order not found for payment');
    });
  });
});
