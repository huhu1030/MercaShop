import type { SelectionMode } from '@mercashop/shared';

export interface ProductResponse {
  _id: string;
  tenantId: string;
  name: string;
  establishmentId: string;
  description?: string;
  category: string;
  price: number;
  location?: string;
  quantity: number;
  serialNumber?: string;
  photo?: string;
  optionGroups: OptionGroupBody[];
}

export interface OptionChoiceBody {
  /** @minLength 1 */
  name: string;
  /** @minimum 0 */
  extraPrice: number;
  /** @isInt @minimum 1 */
  maxQuantity: number;
}

export interface OptionGroupBody {
  /** @minLength 1 */
  name: string;
  required: boolean;
  selectionMode: SelectionMode;
  /** @isInt @minimum 1 */
  maxSelections?: number;
  choices: OptionChoiceBody[];
}

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
  optionGroups?: OptionGroupBody[];
}

export interface UpdateProductBody {
  /** @minLength 1 @maxLength 200 */
  name?: string;
  /** @maxLength 2000 */
  description?: string;
  /** @minLength 1 */
  category?: string;
  /** @minimum 0 */
  price?: number;
  location?: string;
  /** @isInt @minimum 0 */
  quantity?: number;
  serialNumber?: string;
  optionGroups?: OptionGroupBody[];
}

export interface UpdateProductQuantityBody {
  /** @isInt @minimum 0 */
  quantity: number;
}
