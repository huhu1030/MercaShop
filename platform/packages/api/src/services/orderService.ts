import type { ClientSession } from 'mongoose';
import { OrderModel, ProductModel, EstablishmentModel } from '../models';
import { withTransaction } from '../utils/transaction';
import SocketServer from './socketServer';
import type { Order, OrderLine } from '../types/order';

async function decrementStock(orderLines: OrderLine[], session: ClientSession) {
  await Promise.all(
    orderLines.map((line) =>
      ProductModel.findByIdAndUpdate(
        line.item._id,
        { $inc: { quantity: -line.item.quantity } },
        { session },
      ),
    ),
  );
}

export async function linkMolliePayment(orderId: string, molliePaymentId: string): Promise<void> {
  await OrderModel.findByIdAndUpdate(orderId, { mollieOrderId: molliePaymentId });
}

export async function markPaidAndDecrementStock(order: Order): Promise<void> {
  await withTransaction(async (session) => {
    await OrderModel.findByIdAndUpdate(order._id, { isPaid: true }, { session });
    await decrementStock(order.orderLines, session);
  });
}

export async function markUnpaidAndDecrementStock(order: Order): Promise<void> {
  await withTransaction(async (session) => {
    await OrderModel.findByIdAndUpdate(order._id, { isPaid: false }, { session });
    await decrementStock(order.orderLines, session);
  });
}

export async function findByMolliePaymentId(molliePaymentId: string): Promise<Order | null> {
  return OrderModel.findOne({ mollieOrderId: molliePaymentId }).lean<Order>();
}

export async function notifyEstablishment(
  tenantId: string,
  establishmentId: string,
  order: Order,
): Promise<void> {
  const establishment = await EstablishmentModel.findOne({ tenantId, _id: establishmentId });
  if (establishment) {
    SocketServer.getInstance().sendOrders(order);
  }
}

export function notifyRealtime(order: Order): void {
  SocketServer.getInstance().sendOrders(order);
}
