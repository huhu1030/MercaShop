import { Controller, Get, Post, Delete, Patch, Route, Path, Body, Security, Request as TsoaRequest } from 'tsoa';
import { Request } from 'express';
import { ProductModel } from '../models';

interface CreateProductBody {
  name: string;
  establishmentId: string;
  description?: string;
  category: string;
  price: number;
  location?: string;
  quantity?: number;
  serialNumber?: string;
}

@Route('api/products')
export class ProductController extends Controller {
  @Post('')
  @Security('BearerAuth')
  public async createProduct(
    @TsoaRequest() req: Request,
    @Body() body: CreateProductBody,
  ): Promise<{ product: any }> {
    const product = await ProductModel.create({ tenantId: req.tenantId, ...body });
    this.setStatus(201);
    return { product };
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getProduct(
    @TsoaRequest() req: Request,
    @Path() id: string,
  ): Promise<{ product: any }> {
    const product = await ProductModel.findOne({ _id: id, tenantId: req.tenantId });
    if (!product) {
      this.setStatus(404);
      throw new Error('Product not found');
    }
    return { product };
  }

  @Get('establishment/{establishmentId}')
  @Security('BearerAuth')
  public async getProductsByEstablishment(
    @TsoaRequest() req: Request,
    @Path() establishmentId: string,
  ): Promise<{ products: any[] }> {
    const products = await ProductModel.find({
      tenantId: req.tenantId,
      establishmentId,
    });
    return { products };
  }

  @Delete('{id}')
  @Security('BearerAuth')
  public async deleteProduct(
    @TsoaRequest() req: Request,
    @Path() id: string,
  ): Promise<{ message: string }> {
    await ProductModel.findOneAndDelete({ _id: id, tenantId: req.tenantId });
    return { message: 'Product deleted' };
  }

  @Patch('{id}/quantity')
  @Security('BearerAuth')
  public async updateQuantity(
    @TsoaRequest() req: Request,
    @Path() id: string,
    @Body() body: { quantity: number },
  ): Promise<{ product: any }> {
    const product = await ProductModel.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      { quantity: body.quantity },
      { new: true },
    );
    if (!product) {
      this.setStatus(404);
      throw new Error('Product not found');
    }
    return { product };
  }
}
