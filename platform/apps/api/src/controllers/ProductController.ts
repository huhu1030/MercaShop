import { Controller, Get, Post, Delete, Patch, Route, Tags, Path, Body, Security, Request } from 'tsoa';
import type { Request as ExpressRequest } from 'express';
import type { CreateProductBody, UpdateProductBody, UpdateProductQuantityBody, ProductResponse } from '../dtos/product.dto';
import * as productService from '../services/productService';

function getTenantId(req: ExpressRequest): string {
  const tenantId = req.tenantId;
  if (!tenantId) throw new Error('Tenant not resolved');
  return tenantId;
}

@Route('api/products')
@Tags('Product')
export class ProductController extends Controller {
  @Post('')
  @Security('BearerAuth')
  public async createProduct(@Request() req: ExpressRequest, @Body() body: CreateProductBody): Promise<{ product: ProductResponse }> {
    const product = await productService.createProduct(getTenantId(req), body);
    this.setStatus(201);
    return { product };
  }

  @Get('{id}')
  @Security('BearerAuth')
  public async getProduct(@Request() req: ExpressRequest, @Path() id: string): Promise<{ product: ProductResponse }> {
    const product = await productService.findProductById(id, getTenantId(req));
    if (!product) {
      this.setStatus(404);
      throw new Error('Product not found');
    }
    return { product };
  }

  @Get('establishment/{establishmentId}')
  @Security('BearerAuth')
  public async getProductsByEstablishment(@Request() req: ExpressRequest, @Path() establishmentId: string): Promise<{ products: ProductResponse[] }> {
    const products = await productService.findProductsByEstablishment(getTenantId(req), establishmentId);
    return { products };
  }

  @Delete('{id}')
  @Security('BearerAuth')
  public async deleteProduct(@Request() req: ExpressRequest, @Path() id: string): Promise<{ message: string }> {
    await productService.deleteProduct(id, getTenantId(req));
    return { message: 'Product deleted' };
  }

  @Patch('{id}')
  @Security('BearerAuth')
  public async updateProduct(
    @Request() req: ExpressRequest,
    @Path() id: string,
    @Body() body: UpdateProductBody,
  ): Promise<{ product: ProductResponse }> {
    const product = await productService.updateProduct(id, getTenantId(req), body);
    if (!product) {
      this.setStatus(404);
      throw new Error('Product not found');
    }
    return { product };
  }

  @Patch('{id}/quantity')
  @Security('BearerAuth')
  public async updateQuantity(@Request() req: ExpressRequest, @Path() id: string, @Body() body: UpdateProductQuantityBody): Promise<{ product: ProductResponse }> {
    const product = await productService.updateProductQuantity(id, getTenantId(req), body.quantity);
    if (!product) {
      this.setStatus(404);
      throw new Error('Product not found');
    }
    return { product };
  }
}
