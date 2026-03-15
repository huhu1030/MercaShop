import * as mollieService from './mollieService';
import * as orderService from './orderService';
import * as notificationService from './notificationService';
import { getCurrentDateTimeEuro } from '../utils/date';
import type { Order } from '../types/order';

export async function handleCardPayment(
  _userEmail: string,
  order: Order & { userId: string },
): Promise<{ checkoutUrl: string }> {
  const description = `Order from ${getCurrentDateTimeEuro()} for User ${order.userId}`;

  const payment = await mollieService.createPayment({
    amount: order.total.toFixed(2),
    description,
    orderId: order._id,
  });

  await orderService.linkMolliePayment(order._id, (payment as any).id);

  return { checkoutUrl: (payment as any)._links?.checkout?.href ?? '' };
}

export async function handleCashPayment(
  tenantId: string,
  userEmail: string,
  order: Order & { establishmentId: string },
): Promise<void> {
  await orderService.markUnpaidAndDecrementStock(order);
  await orderService.notifyEstablishment(tenantId, order.establishmentId, order);
  await notificationService.sendOrderConfirmation(userEmail, order);
}

export async function handleWebhook(paymentId: string): Promise<{ status: string }> {
  const payment = await mollieService.fetchPaymentById(paymentId);
  const order = await orderService.findByMolliePaymentId(paymentId);

  if (!order) {
    throw new Error('Order not found for payment');
  }

  if (payment.status === 'paid') {
    await orderService.markPaidAndDecrementStock(order);
    orderService.notifyRealtime(order);
    await notificationService.sendOrderConfirmationToUser(order.userId, order);
  }

  return { status: payment.status };
}
