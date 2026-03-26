export interface CreateProductBody {
  /** @minLength 1 @maxLength 200 */
  name: string;
  establishmentId: string;
  /** @maxLength 2000 */
  description?: string;
  /** @minLength 1 */
  category: string;
  /** @minimum 0 */
  price: number;
  location?: string;
  /** @isInt @minimum 0 */
  quantity?: number;
  serialNumber?: string;
}

export interface UpdateProductQuantityBody {
  /** @isInt @minimum 0 */
  quantity: number;
}
