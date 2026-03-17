import { sendEmail, mailTemplates } from './mailService';
import { getCurrentDateTimeEuro } from '../utils/date';
import { truncateToLast5Digits } from '../utils/string';
import { UserModel } from '../models';
import type { Order } from '../types/order';

function buildConfirmationData(order: Order) {
  return {
    items: order.orderLines.map((l) => ({
      name: l.item.name,
      quantity: l.item.quantity,
      price: l.item.price ?? 0,
    })),
    amount: order.total,
    date: getCurrentDateTimeEuro(),
    number: truncateToLast5Digits(order._id.toString()),
  };
}

export async function sendOrderConfirmation(email: string, order: Order): Promise<void> {
  await sendEmail(email, mailTemplates.orderConfirmation, buildConfirmationData(order));
}

export async function sendOrderConfirmationToUser(userId: string, order: Order): Promise<void> {
  const user = await UserModel.findById(userId);
  if (user) {
    await sendOrderConfirmation(user.email, order);
  }
}
