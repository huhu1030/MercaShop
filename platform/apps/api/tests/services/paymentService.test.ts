import { handleCardPayment, handleCashPayment, handleWebhook, processPayment } from '../../src/services/paymentService';
import { PaymentMethod } from '../../src/types/order';

jest.mock('../../src/services/mollieService', () => ({
  createPayment: jest.fn().mockResolvedValue({
    id: 'tr_mock123',
    _links: { checkout: { href: 'https://checkout.mollie.com/mock' } },
  }),
  fetchPaymentById: jest.fn(),
}));

jest.mock('../../src/services/orderService', () => ({
  findOrderById: jest.fn(),
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

jest.mock('../../src/services/userService', () => ({
  findUserByFirebaseUid: jest.fn().mockResolvedValue({ email: 'user@test.com' }),
}));

import * as mollieService from '../../src/services/mollieService';
import * as orderService from '../../src/services/orderService';
import * as notificationService from '../../src/services/notificationService';
import * as userService from '../../src/services/userService';

const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
  userId: 'user-1',
  establishmentId: 'est-1',
  total: 25.5,
  orderLines: [{ item: { _id: 'prod-1', name: 'Pizza', quantity: 2, price: 12.75 } }],
};

describe('paymentService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('handleCardPayment', () => {
    it('creates Mollie payment and returns checkout URL', async () => {
      const result = await handleCardPayment('user@test.com', mockOrder, 'https://test.example.com/order/order-1/status');
      expect(result.checkoutUrl).toBe('https://checkout.mollie.com/mock');
    });

    it('links mollie payment to order', async () => {
      await handleCardPayment('user@test.com', mockOrder, 'https://test.example.com/order/order-1/status');
      expect(orderService.linkMolliePayment).toHaveBeenCalledWith(mockOrder._id, 'tr_mock123');
    });

    it('does not send a confirmation email', async () => {
      await handleCardPayment('user@test.com', mockOrder, 'https://test.example.com/order/order-1/status');
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

  describe('processPayment — BANCONTACT routing', () => {
    const mockOrderDoc = {
      ...mockOrder,
      toObject: () => mockOrder,
      _id: { toString: () => mockOrder._id },
    };

    beforeEach(() => {
      (orderService.findOrderById as jest.Mock).mockResolvedValue(mockOrderDoc);
      (userService.findUserByFirebaseUid as jest.Mock).mockResolvedValue({ email: 'user@test.com' });
    });

    it('routes BANCONTACT payments through Mollie (same as CARD)', async () => {
      const result = await processPayment('tenant-1', 'firebase-uid', 'user@test.com', mockOrder._id, PaymentMethod.BANCONTACT, ['lebon.be']);
      expect(result.checkoutUrl).toBe('https://checkout.mollie.com/mock');
      expect(mollieService.createPayment).toHaveBeenCalled();
    });

    it('constructs redirect URL from tenant storefront domain', async () => {
      await processPayment('tenant-1', 'firebase-uid', 'user@test.com', mockOrder._id, PaymentMethod.BANCONTACT, ['dashboard.lebon.be', 'lebon.be']);
      expect(mollieService.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUrl: `https://lebon.be/order/${mockOrder._id}/status`,
        }),
      );
    });

    it('uses http protocol for localhost domains', async () => {
      await processPayment('tenant-1', 'firebase-uid', 'user@test.com', mockOrder._id, PaymentMethod.CARD, ['localhost:3000']);
      expect(mollieService.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUrl: `http://localhost:3000/order/${mockOrder._id}/status`,
        }),
      );
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
