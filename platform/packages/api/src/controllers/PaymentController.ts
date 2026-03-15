import { Controller, Post, Get, Route, Path, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import { OrderModel, UserModel } from '../models';
import { handleCardPayment, handleCashPayment, handleWebhook } from '../services/paymentService';

@Route('api/payments')
export class PaymentController extends Controller {
  @Post('')
  @Security('BearerAuth')
  public async processPayment(
    @Request() req: ExpressRequest,
    @Body() body: { orderId: string; paymentMethod: string },
  ): Promise<{ checkoutUrl?: string; message?: string }> {
    const order = await OrderModel.findOne({
      _id: body.orderId,
      tenantId: req.tenantId,
    });
    if (!order) {
      this.setStatus(404);
      throw new Error('Order not found');
    }

    const user = await UserModel.findOne({
      tenantId: req.tenantId,
      firebaseUid: req.firebaseUser!.uid,
    });
    const email = user?.email ?? req.firebaseUser!.email;

    if (body.paymentMethod === 'CARD') {
      return handleCardPayment(email, order);
    }

    await handleCashPayment(req.tenantId!, email, order);
    return { message: 'Cash order placed' };
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getPaymentStatus(
    @Request() req: ExpressRequest,
    @Path() id: string,
  ): Promise<{ order: any }> {
    const order = await OrderModel.findOne({ _id: id, tenantId: req.tenantId });
    if (!order) {
      this.setStatus(404);
      throw new Error('Order not found');
    }
    return { order };
  }
}

@Route('webhook')
export class WebhookController extends Controller {
  @Post('')
  public async mollieWebhook(@Body() body: { id: string }): Promise<{ status: string }> {
    return handleWebhook(body.id);
  }
}
