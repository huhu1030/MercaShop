import { Controller, Post, Get, Route, Tags, Path, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import type { ProcessPaymentBody, MollieWebhookBody } from '../dtos/payment.dto';
import * as paymentService from '../services/paymentService';
import * as orderService from '../services/orderService';

@Route('api/payments')
@Tags('Payment')
export class PaymentController extends Controller {
  @Post('')
  @Security('BearerAuth')
  public async processPayment(
    @Request() req: ExpressRequest,
    @Body() body: ProcessPaymentBody,
  ): Promise<{ checkoutUrl?: string; message?: string }> {
    try {
      if (!req.tenant) {
        this.setStatus(500);
        throw new Error('Tenant not resolved');
      }
      const tenantDomains = req.tenant.domains;
      return await paymentService.processPayment(
        req.tenantId!,
        req.firebaseUser!.uid,
        req.firebaseUser!.email,
        body.orderId,
        body.paymentMethod,
        tenantDomains,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'Order not found' || message === 'Establishment not found') {
        this.setStatus(404);
      } else if (message === 'Establishment is currently closed') {
        this.setStatus(400);
      }
      throw error;
    }
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getPaymentStatus(@Request() req: ExpressRequest, @Path() id: string): Promise<{ order: any }> {
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
  public async mollieWebhook(@Body() body: MollieWebhookBody): Promise<{ status: string }> {
    return paymentService.handleWebhook(body.id);
  }
}
