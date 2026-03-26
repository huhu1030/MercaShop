import type { ClientSession } from 'mongoose';
import { OrderModel, ProductModel, EstablishmentModel } from '../models';
import { withTransaction } from '../utils/transaction';
import SocketServer from './socketServer';
import type { Order, OrderLine } from '../types/order';
import type { OrderDocument } from '../models/Order';
import { EstablishmentStatus } from '@mercashop/shared';
import type { CreateOrderBody } from '../dtos/order.dto';

export async function createOrder(tenantId: string, userId: string, body: CreateOrderBody): Promise<OrderDocument> {
  const establishment = await EstablishmentModel.findOne({
    _id: body.establishmentId,
    tenantId,
  });

  if (!establishment) {
    throw new Error('Establishment not found');
  }

  if (establishment.status !== EstablishmentStatus.OPEN) {
    throw new Error('Establishment is currently closed');
  }

  const trimmedRemark = body.remark?.trim() || undefined;
  return OrderModel.create({ tenantId, userId, ...body, remark: trimmedRemark });
}

export async function findOrderById(id: string, tenantId: string): Promise<OrderDocument | null> {
  return OrderModel.findOne({ _id: id, tenantId });
}

export async function findOrdersByEstablishment(tenantId: string, establishmentId: string): Promise<OrderDocument[]> {
  return OrderModel.find({ tenantId, establishmentId });
}

export async function findOrdersByUser(tenantId: string, userId: string): Promise<OrderDocument[]> {
  return OrderModel.find({ tenantId, userId });
}

export async function updateOrderStatus(id: string, tenantId: string, status: string): Promise<OrderDocument | null> {
  return OrderModel.findOneAndUpdate({ _id: id, tenantId }, { status }, { new: true });
}

export async function deleteOrder(id: string, tenantId: string): Promise<void> {
  await OrderModel.findOneAndDelete({ _id: id, tenantId });
}

async function decrementStock(orderLines: OrderLine[], session: ClientSession) {
  await Promise.all(
    orderLines.map((line) => ProductModel.findByIdAndUpdate(line.item._id, { $inc: { quantity: -line.item.quantity } }, { session })),
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

export async function notifyEstablishment(tenantId: string, establishmentId: string, order: Order): Promise<void> {
  const establishment = await EstablishmentModel.findOne({ tenantId, _id: establishmentId });
  if (establishment) {
    try {
      SocketServer.getInstance().sendOrders(order);
      SocketServer.getInstance().sendOrderUpdate(order._id, order as unknown as Record<string, unknown>);
    } catch (err) {
      console.error('Socket notification to establishment failed:', err);
    }
  }
}

export function notifyRealtime(order: Order): void {
  try {
    SocketServer.getInstance().sendOrders(order);
    SocketServer.getInstance().sendOrderUpdate(order._id, order as unknown as Record<string, unknown>);
  } catch (err) {
    console.error('Realtime socket notification failed:', err);
  }
}
