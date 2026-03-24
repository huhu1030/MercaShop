import createMollieClient, { MollieClient } from '@mollie/api-client';
import { env } from '../config/env';

let mollieClient: MollieClient;

function getMollieClient(): MollieClient {
  if (!mollieClient) {
    if (!env.mollieKey) {
      throw new Error('MOLLIE_KEY is not configured');
    }
    mollieClient = createMollieClient({ apiKey: env.mollieKey });
  }
  return mollieClient;
}

const AMOUNT_RE = /^\d+\.\d{2}$/;
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

export interface CreatePaymentOptions {
  amount: string;
  description: string;
  orderId: string;
  redirectUrl: string;
  currency?: string;
  methods?: string[];
}

export async function createPayment(opts: CreatePaymentOptions) {
  const { amount, description, orderId, redirectUrl, currency = 'EUR', methods = ['creditcard', 'bancontact'] } = opts;

  if (!AMOUNT_RE.test(amount) || parseFloat(amount) <= 0) {
    throw new Error('Invalid payment amount: must be a positive number with two decimals');
  }

  if (!OBJECT_ID_RE.test(orderId)) {
    throw new Error('Invalid orderId format');
  }

  return getMollieClient().payments.create({
    amount: { value: amount, currency },
    method: methods,
    description,
    redirectUrl,
    webhookUrl: `${env.apiUrl}/webhook`,
    idempotencyKey: orderId,
  } as any);
}

export async function fetchPaymentById(id: string) {
  return getMollieClient().payments.get(id);
}
