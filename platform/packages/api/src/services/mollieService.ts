import createMollieClient from '@mollie/api-client';
import { env } from '../config/env';

const mollieClient = createMollieClient({ apiKey: env.mollieKey });

export async function createPayment(
  amount: string,
  description: string,
  orderId: string,
) {
  return mollieClient.payments.create({
    amount: { value: amount, currency: 'EUR' },
    method: ['creditcard', 'bancontact'],
    description,
    redirectUrl: `be.mercashop.app://paymentstatus/${orderId}`,
    webhookUrl: `${env.apiUrl}/webhook`,
  });
}

export async function fetchPaymentById(id: string) {
  return mollieClient.payments.get(id);
}
