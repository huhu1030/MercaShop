import mongoose from 'mongoose';
import * as mollieService from './mollieService';
import { sendEmail, mailTemplates } from './mailService';
import { getCurrentDateTimeEuro } from '../utils/date';
import { truncateToLast5Digits } from '../utils/string';
import { OrderModel, UserModel, ProductModel, EstablishmentModel } from '../models';
import SocketServer from './socketServer';

function buildConfirmationData(order: { _id: string | { toString(): string }; total: number; orderLines: any[] }) {
  return {
    orderItems: order.orderLines.map((l) => ({
      name: l.item.name,
      quantity: l.item.quantity,
      price: l.item.price ?? 0,
    })),
    orderAmount: order.total,
    orderDate: getCurrentDateTimeEuro(),
    orderNumber: truncateToLast5Digits(order._id.toString()),
  };
}

async function decrementStock(orderLines: any[], session?: mongoose.ClientSession) {
  const opts = session ? { session } : {};
  await Promise.all(
    orderLines.map((line) =>
      ProductModel.findByIdAndUpdate(line.item._id, { $inc: { quantity: -line.item.quantity } }, opts),
    ),
  );
}

export async function handleCardPayment(
  _userEmail: string,
  order: { _id: string; userId: string; total: number; orderLines: any[] },
): Promise<{ checkoutUrl: string }> {
  const description = `Order from ${getCurrentDateTimeEuro()} for User ${order.userId}`;
  const payment = await mollieService.createPayment({
    amount: order.total.toFixed(2),
    description,
    orderId: order._id,
  }) as any;

  await OrderModel.findByIdAndUpdate(order._id, { mollieOrderId: payment.id });

  return { checkoutUrl: (payment as any)._links?.checkout?.href ?? '' };
}

export async function handleCashPayment(
  tenantId: string,
  userEmail: string,
  order: { _id: string; establishmentId: string; total: number; orderLines: any[] },
): Promise<void> {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await OrderModel.findByIdAndUpdate(order._id, { isPaid: false }, { session });
      await decrementStock(order.orderLines, session);
    });
  } finally {
    await session.endSession();
  }

  const establishment = await EstablishmentModel.findOne({
    tenantId,
    _id: order.establishmentId,
  });
  if (establishment) {
    SocketServer.getInstance().sendOrders(order);
  }

  await sendEmail(userEmail, mailTemplates.orderConfirmation, buildConfirmationData(order));
}

export async function handleWebhook(paymentId: string): Promise<{ status: string }> {
  const payment = await mollieService.fetchPaymentById(paymentId);
  const order = await OrderModel.findOne({ mollieOrderId: paymentId });

  if (!order) {
    throw new Error('Order not found for payment');
  }

  if (payment.status === 'paid') {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await OrderModel.findByIdAndUpdate(order._id, { isPaid: true }, { session });
        await decrementStock(order.orderLines, session);
      });
    } finally {
      await session.endSession();
    }

    SocketServer.getInstance().sendOrders(order);

    const user = await UserModel.findById(order.userId);
    if (user) {
      await sendEmail(user.email, mailTemplates.orderConfirmation, buildConfirmationData(order));
    }
  }

  return { status: payment.status };
}
