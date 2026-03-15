import { Controller, Get, Post, Patch, Delete, Route, Path, Body, Security, Request as TsoaRequest } from 'tsoa';
import { Request } from 'express';
import { OrderModel } from '../models';

interface CreateOrderBody {
  establishmentId: string;
  orderLines: Array<{ item: { _id: string; name: string; quantity: number; price?: number } }>;
  total: number;
  deliveryAddress?: Record<string, unknown>;
  billingInformation?: Record<string, unknown>;
  paymentMethod: string;
  deliveryMethod?: string;
}

@Route('api/orders')
export class OrderController extends Controller {
  @Post('')
  @Security('BearerAuth')
  public async createOrder(
    @TsoaRequest() req: Request,
    @Body() body: CreateOrderBody,
  ): Promise<{ order: any }> {
    const order = await OrderModel.create({
      tenantId: req.tenantId,
      userId: req.firebaseUser!.uid,
      ...body,
    });
    this.setStatus(201);
    return { order };
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getOrder(
    @TsoaRequest() req: Request,
    @Path() id: string,
  ): Promise<{ order: any }> {
    const order = await OrderModel.findOne({ _id: id, tenantId: req.tenantId });
    if (!order) {
      this.setStatus(404);
      throw new Error('Order not found');
    }
    return { order };
  }

  @Get('establishment/{establishmentId}')
  @Security('BearerAuth')
  public async getOrdersByEstablishment(
    @TsoaRequest() req: Request,
    @Path() establishmentId: string,
  ): Promise<{ orders: any[] }> {
    const orders = await OrderModel.find({
      tenantId: req.tenantId,
      establishmentId,
    });
    return { orders };
  }

  @Get('user/{userId}')
  @Security('BearerAuth')
  public async getOrdersByUser(
    @TsoaRequest() req: Request,
    @Path() userId: string,
  ): Promise<{ orders: any[] }> {
    const orders = await OrderModel.find({
      tenantId: req.tenantId,
      userId,
    });
    return { orders };
  }

  @Patch('{id}/status')
  @Security('BearerAuth')
  public async updateOrderStatus(
    @TsoaRequest() req: Request,
    @Path() id: string,
    @Body() body: { status: string },
  ): Promise<{ order: any }> {
    const order = await OrderModel.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      { status: body.status },
      { new: true },
    );
    if (!order) {
      this.setStatus(404);
      throw new Error('Order not found');
    }
    return { order };
  }

  @Delete('{id}')
  @Security('BearerAuth')
  public async deleteOrder(
    @TsoaRequest() req: Request,
    @Path() id: string,
  ): Promise<{ message: string }> {
    await OrderModel.findOneAndDelete({ _id: id, tenantId: req.tenantId });
    return { message: 'Order deleted' };
  }
}
