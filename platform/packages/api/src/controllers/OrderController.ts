import { Controller, Get, Post, Patch, Delete, Route, Path, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import { PaymentMethod } from '../types/order';
import * as orderService from '../services/orderService';

interface CreateOrderBody {
  establishmentId: string;
  orderLines: Array<{ item: { _id: string; name: string; quantity: number; price?: number } }>;
  total: number;
  deliveryAddress?: Record<string, unknown>;
  billingInformation?: Record<string, unknown>;
  paymentMethod: PaymentMethod;
  deliveryMethod?: string;
}

@Route('api/orders')
export class OrderController extends Controller {
  @Post('')
  @Security('BearerAuth')
  public async createOrder(
    @Request() req: ExpressRequest,
    @Body() body: CreateOrderBody,
  ): Promise<{ order: any }> {
    const order = await orderService.createOrder({
      tenantId: req.tenantId!,
      userId: req.firebaseUser!.uid,
      ...body,
    });
    this.setStatus(201);
    return { order };
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getOrder(
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

  @Get('establishment/{establishmentId}')
  @Security('BearerAuth')
  public async getOrdersByEstablishment(
    @Request() req: ExpressRequest,
    @Path() establishmentId: string,
  ): Promise<{ orders: any[] }> {
    const orders = await orderService.findOrdersByEstablishment(req.tenantId!, establishmentId);
    return { orders };
  }

  @Get('user/{userId}')
  @Security('BearerAuth')
  public async getOrdersByUser(
    @Request() req: ExpressRequest,
    @Path() userId: string,
  ): Promise<{ orders: any[] }> {
    const orders = await orderService.findOrdersByUser(req.tenantId!, userId);
    return { orders };
  }

  @Patch('{id}/status')
  @Security('BearerAuth')
  public async updateOrderStatus(
    @Request() req: ExpressRequest,
    @Path() id: string,
    @Body() body: { status: string },
  ): Promise<{ order: any }> {
    const order = await orderService.updateOrderStatus(id, req.tenantId!, body.status);
    if (!order) {
      this.setStatus(404);
      throw new Error('Order not found');
    }
    return { order };
  }

  @Delete('{id}')
  @Security('BearerAuth')
  public async deleteOrder(
    @Request() req: ExpressRequest,
    @Path() id: string,
  ): Promise<{ message: string }> {
    await orderService.deleteOrder(id, req.tenantId!);
    return { message: 'Order deleted' };
  }
}
