import createMollieClient from '@mollie/api-client';
import { env } from '../config/env';

const mollieClient = createMollieClient({ apiKey: env.mollieKey });

const AMOUNT_RE = /^\d+\.\d{2}$/;
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export interface CreatePaymentOptions {
  amount: string;
  description: string;
  orderId: string;
  currency?: string;
  methods?: string[];
}

export async function createPayment(opts: CreatePaymentOptions) {
  const { amount, description, orderId, currency = 'EUR', methods = ['creditcard', 'bancontact'] } = opts;

  if (!AMOUNT_RE.test(amount) || parseFloat(amount) <= 0) {
    throw new Error('Invalid payment amount: must be a positive number with two decimals');
  }

  if (!OBJECT_ID_RE.test(orderId)) {
    throw new Error('Invalid orderId format');
  }

  return mollieClient.payments.create({
    amount: { value: amount, currency },
    method: methods,
    description,
    redirectUrl: `be.mercashop.app://paymentstatus/${orderId}`,
    webhookUrl: `${env.apiUrl}/webhook`,
    idempotencyKey: orderId,
  } as any);
}

export async function fetchPaymentById(id: string) {
  return mollieClient.payments.get(id);
}
