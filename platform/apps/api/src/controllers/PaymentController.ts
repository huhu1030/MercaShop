import { Controller, Post, Get, Route, Tags, Path, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import { PaymentMethod } from '../types/order';
import * as paymentService from '../services/paymentService';
import * as orderService from '../services/orderService';

@Route('api/payments')
@Tags('Payment')
export class PaymentController extends Controller {
  @Post('')
  @Security('BearerAuth')
  public async processPayment(
    @Request() req: ExpressRequest,
    @Body() body: { orderId: string; paymentMethod: PaymentMethod },
  ): Promise<{ checkoutUrl?: string; message?: string }> {
    try {
      return await paymentService.processPayment(
        req.tenantId!,
        req.firebaseUser!.uid,
        req.firebaseUser!.email,
        body.orderId,
        body.paymentMethod,
      );
    } catch (error: any) {
      if (error.message === 'Order not found') {
        this.setStatus(404);
      }
      throw error;
    }
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getPaymentStatus(
    @Request() req: ExpressRequest,
    @Path() id: string,
  ): Promise<{ order: any }> {
    const order = await orderService.findOrderById(id, req.tenantId!);
    if (!order) {
      this.setStatus(404);
      throw new Error('Order not found');
    }
    return { order };
  }
}

@Route('webhook')
@Tags('Webhook')
export class WebhookController extends Controller {
  @Post('')
  public async mollieWebhook(@Body() body: { id: string }): Promise<{ status: string }> {
    return paymentService.handleWebhook(body.id);
  }
}
