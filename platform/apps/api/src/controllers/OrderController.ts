import { Controller, Get, Post, Patch, Delete, Route, Tags, Path, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import * as orderService from '../services/orderService';
import type { CreateOrderBody, UpdateOrderStatusBody } from '../dtos/order.dto';

@Route('api/orders')
@Tags('Order')
export class OrderController extends Controller {
  @Post('')
  @Security('BearerAuth')
  public async createOrder(@Request() req: ExpressRequest, @Body() body: CreateOrderBody): Promise<{ order: any }> {
    try {
      const order = await orderService.createOrder(req.tenantId!, req.firebaseUser!.uid, body);
      this.setStatus(201);
      return { order };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Order creation failed';
      if (message === 'Establishment not found') {
        this.setStatus(404);
      } else if (message === 'Establishment is currently closed') {
        this.setStatus(400);
      }
      throw error;
    }
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getOrder(@Request() req: ExpressRequest, @Path() id: string): Promise<{ order: any }> {
    const order = await orderService.findOrderById(id, req.tenantId!);
    if (!order) {
      this.setStatus(404);
      throw new Error('Order not found');
    }
    return { order };
  }

  @Get('establishment/{establishmentId}')
  @Security('BearerAuth')
  public async getOrdersByEstablishment(@Request() req: ExpressRequest, @Path() establishmentId: string): Promise<{ orders: any[] }> {
    const orders = await orderService.findOrdersByEstablishment(req.tenantId!, establishmentId);
    return { orders };
  }

  @Get('user/{userId}')
  @Security('BearerAuth')
  public async getOrdersByUser(@Request() req: ExpressRequest, @Path() userId: string): Promise<{ orders: any[] }> {
    const orders = await orderService.findOrdersByUser(req.tenantId!, userId);
    return { orders };
  }

  @Patch('{id}/status')
  @Security('BearerAuth')
  public async updateOrderStatus(@Request() req: ExpressRequest, @Path() id: string, @Body() body: UpdateOrderStatusBody): Promise<{ order: any }> {
    const order = await orderService.updateOrderStatus(id, req.tenantId!, body.status);
    if (!order) {
      this.setStatus(404);
      throw new Error('Order not found');
    }
    return { order };
  }

  @Delete('{id}')
  @Security('BearerAuth')
  public async deleteOrder(@Request() req: ExpressRequest, @Path() id: string): Promise<{ message: string }> {
    await orderService.deleteOrder(id, req.tenantId!);
    return { message: 'Order deleted' };
  }
}
