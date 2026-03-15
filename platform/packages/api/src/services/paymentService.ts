import * as mollieService from './mollieService';
import { sendEmail, mailTemplates } from './mailService';
import { getCurrentDateTimeEuro } from '../utils/date';
import { truncateToLast5Digits } from '../utils/string';
import { OrderModel, UserModel, ProductModel, EstablishmentModel } from '../models';
import SocketServer from './socketServer';

export async function handleCardPayment(
  userEmail: string,
  order: { _id: string; userId: string; total: number; orderLines: any[] },
): Promise<{ checkoutUrl: string }> {
  const description = `Order from ${getCurrentDateTimeEuro()} for User ${order.userId}`;
  const payment = await mollieService.createPayment(
    order.total.toFixed(2),
    description,
    order._id,
  ) as any;

  await OrderModel.findByIdAndUpdate(order._id, { mollieOrderId: payment.id });

  await sendEmail(userEmail, mailTemplates.orderConfirmation, {
    orderItems: order.orderLines.map((l) => ({
      name: l.item.name,
      quantity: l.item.quantity,
      price: l.item.price ?? 0,
    })),
    orderAmount: order.total,
    orderDate: getCurrentDateTimeEuro(),
    orderNumber: truncateToLast5Digits(order._id),
  });

  return { checkoutUrl: (payment as any)._links?.checkout?.href ?? '' };
}

export async function handleCashPayment(
  tenantId: string,
  userEmail: string,
  order: { _id: string; establishmentId: string; total: number; orderLines: any[] },
): Promise<void> {
  await OrderModel.findByIdAndUpdate(order._id, { isPaid: false });

  const establishment = await EstablishmentModel.findOne({
    tenantId,
    _id: order.establishmentId,
  });
  if (establishment) {
    SocketServer.getInstance().sendOrders(order);
  }

  for (const line of order.orderLines) {
    await ProductModel.findByIdAndUpdate(line.item._id, {
      $inc: { quantity: -line.item.quantity },
    });
  }

  await sendEmail(userEmail, mailTemplates.orderConfirmation, {
    orderItems: order.orderLines.map((l) => ({
      name: l.item.name,
      quantity: l.item.quantity,
      price: l.item.price ?? 0,
    })),
    orderAmount: order.total,
    orderDate: getCurrentDateTimeEuro(),
    orderNumber: truncateToLast5Digits(order._id),
  });
}

export async function handleWebhook(paymentId: string): Promise<{ status: string }> {
  const payment = await mollieService.fetchPaymentById(paymentId);
  const order = await OrderModel.findOne({ mollieOrderId: paymentId });

  if (!order) {
    throw new Error('Order not found for payment');
  }

  if (payment.status === 'paid') {
    await OrderModel.findByIdAndUpdate(order._id, { isPaid: true });
    SocketServer.getInstance().sendOrders(order);

    for (const line of order.orderLines) {
      await ProductModel.findByIdAndUpdate(line.item._id, {
        $inc: { quantity: -line.item.quantity },
      });
    }

    const user = await UserModel.findById(order.userId);
    if (user) {
      await sendEmail(user.email, mailTemplates.orderConfirmation, {
        orderItems: order.orderLines.map((l) => ({
          name: l.item.name,
          quantity: l.item.quantity,
          price: l.item.price ?? 0,
        })),
        orderAmount: order.total,
        orderDate: getCurrentDateTimeEuro(),
        orderNumber: truncateToLast5Digits(order._id.toString()),
      });
    }
  }

  return { status: payment.status };
}
