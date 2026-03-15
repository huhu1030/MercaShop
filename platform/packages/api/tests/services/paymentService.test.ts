import { handleCardPayment, handleCashPayment, handleWebhook } from '../../src/services/paymentService';

const mockSessionObj = {
  withTransaction: jest.fn(async (fn: () => Promise<void>) => fn()),
  endSession: jest.fn(),
};

jest.mock('mongoose', () => ({
  __esModule: true,
  default: {
    startSession: jest.fn(),
  },
}));

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

import mongoose from 'mongoose';
import * as mollieService from '../../src/services/mollieService';
import { sendEmail } from '../../src/services/mailService';
import { OrderModel, UserModel } from '../../src/models';

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
  beforeEach(() => {
    jest.clearAllMocks();
    (mongoose.startSession as jest.Mock).mockResolvedValue(mockSessionObj);
    mockSessionObj.withTransaction.mockImplementation(async (fn: () => Promise<void>) => fn());
    mockSessionObj.endSession.mockResolvedValue(undefined);
  });

  describe('handleCardPayment', () => {
    it('creates Mollie payment and returns checkout URL', async () => {
      const result = await handleCardPayment('user@test.com', mockOrder);
      expect(result.checkoutUrl).toBe('https://checkout.mollie.com/mock');
    });

    it('does not send a confirmation email (sent on webhook instead)', async () => {
      await handleCardPayment('user@test.com', mockOrder);
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('handleCashPayment', () => {
    it('marks order as unpaid and decrements product quantities in a transaction', async () => {
      await handleCashPayment('tenant-1', 'user@test.com', mockOrder);
      expect(OrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockOrder._id,
        { isPaid: false },
        { session: mockSessionObj },
      );
      expect(mockSessionObj.endSession).toHaveBeenCalled();
    });
  });

  describe('handleWebhook', () => {
    it('marks order as paid when Mollie status is paid', async () => {
      (mollieService.fetchPaymentById as jest.Mock).mockResolvedValue({ status: 'paid' });
      (OrderModel.findOne as jest.Mock).mockResolvedValue({ ...mockOrder, _id: { toString: () => mockOrder._id } });
      (UserModel.findById as jest.Mock).mockResolvedValue({ email: 'user@test.com' });

      const result = await handleWebhook('tr_mock123');
      expect(result.status).toBe('paid');
      expect(OrderModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('sends confirmation email only on paid webhook', async () => {
      (mollieService.fetchPaymentById as jest.Mock).mockResolvedValue({ status: 'paid' });
      (OrderModel.findOne as jest.Mock).mockResolvedValue({ ...mockOrder, _id: { toString: () => mockOrder._id } });
      (UserModel.findById as jest.Mock).mockResolvedValue({ email: 'user@test.com' });

      await handleWebhook('tr_mock123');
      expect(sendEmail).toHaveBeenCalledTimes(1);
    });

    it('throws when order not found for payment', async () => {
      (mollieService.fetchPaymentById as jest.Mock).mockResolvedValue({ status: 'paid' });
      (OrderModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(handleWebhook('tr_unknown')).rejects.toThrow('Order not found for payment');
    });
  });
});
