export interface OrderLineItem {
  _id: string;
  name: string;
  quantity: number;
  price?: number;
}

export interface OrderLine {
  item: OrderLineItem;
}

export interface Order {
  _id: string;
  userId: string;
  establishmentId: string;
  total: number;
  orderLines: OrderLine[];
  mollieOrderId?: string;
}
