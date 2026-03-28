import type { ClientSession } from 'mongoose';
import { OrderModel, ProductModel, EstablishmentModel } from '../models';
import { withTransaction } from '../utils/transaction';
import SocketServer from './socketServer';
import type { Order, OrderLine } from '../types/order';
import type { OrderDocument } from '../models/Order';
import { EstablishmentStatus } from '@mercashop/shared';
import type { CreateOrderBody } from '../dtos/order.dto';
import { validateAndSnapshotOptions } from '../utils/validateOrderOptions';

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

  // Validate and snapshot options for each order line
  const processedOrderLines = await Promise.all(
    body.orderLines.map(async (line) => {
      const product = await ProductModel.findOne({ _id: line.item._id, tenantId });
      if (!product) {
        throw new Error(`Product "${line.item.name}" not found`);
      }

      const clientSelections = line.item.selectedOptions ?? [];
      const { selectedOptions, optionsTotalPrice } = validateAndSnapshotOptions(
        product.optionGroups ?? [],
        clientSelections,
      );

      const lineTotal = (product.price + optionsTotalPrice) * line.item.quantity;

      return {
        item: {
          _id: line.item._id,
          name: line.item.name,
          quantity: line.item.quantity,
          price: product.price,
          ...(selectedOptions.length > 0 && { selectedOptions }),
          ...(optionsTotalPrice > 0 && { optionsTotalPrice }),
        },
        lineTotal,
      };
    }),
  );

  const total = processedOrderLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const orderLines = processedOrderLines.map(({ lineTotal: _, ...rest }) => rest);

  const trimmedRemark = body.remark?.trim() || undefined;
  return OrderModel.create({
    tenantId,
    userId,
    establishmentId: body.establishmentId,
    orderLines,
    total: Math.round(total * 100) / 100,
    deliveryAddress: body.deliveryAddress,
    billingInformation: body.billingInformation,
    paymentMethod: body.paymentMethod,
    deliveryMethod: body.deliveryMethod,
    remark: trimmedRemark,
  });
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
      const socket = SocketServer.getInstance();
      socket.sendNewOrder(tenantId, establishmentId, order);
      socket.sendOrderUpdate(tenantId, order.userId, order);
    } catch (err) {
      console.error('Socket notification to establishment failed:', err);
    }
  }
}

export function notifyRealtime(order: Order): void {
  try {
    const socket = SocketServer.getInstance();
    socket.sendNewOrder(order.tenantId, order.establishmentId, order);
    socket.sendOrderUpdate(order.tenantId, order.userId, order);
  } catch (err) {
    console.error('Realtime socket notification failed:', err);
  }
}
