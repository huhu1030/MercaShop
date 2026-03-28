import { useAtom, useAtomValue } from 'jotai';
import { cartAtom, cartItemCountAtom, cartTotalAtom, type CartItemSelectedOption } from '../lib/cart-store';

interface AddItemInput {
  _id: string;
  name: string;
  price: number;
  photo?: string;
  selectedOptions?: CartItemSelectedOption[];
  optionsTotalPrice?: number;
}

function cartItemKey(productId: string, selectedOptions?: CartItemSelectedOption[]): string {
  if (!selectedOptions || selectedOptions.length === 0) return productId;
  return `${productId}:${JSON.stringify(selectedOptions)}`;
}

export function useCart() {
  const [items, setItems] = useAtom(cartAtom);
  const total = useAtomValue(cartTotalAtom);
  const itemCount = useAtomValue(cartItemCountAtom);

  const addItem = (product: AddItemInput, quantity = 1) => {
    if (quantity <= 0) {
      return;
    }

    const key = cartItemKey(product._id, product.selectedOptions);

    setItems((prev) => {
      const existing = prev.find(
        (item) => cartItemKey(item._id, item.selectedOptions) === key,
      );
      if (existing) {
        return prev.map((item) =>
          cartItemKey(item._id, item.selectedOptions) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...prev, { ...product, quantity }];
    });
  };

  const removeItem = (productId: string, selectedOptions?: CartItemSelectedOption[]) => {
    const key = cartItemKey(productId, selectedOptions);
    setItems((prev) => prev.filter((item) => cartItemKey(item._id, item.selectedOptions) !== key));
  };

  const decrementItem = (productId: string, selectedOptions?: CartItemSelectedOption[]) => {
    const key = cartItemKey(productId, selectedOptions);
    setItems((prev) =>
      prev
        .map((item) => (cartItemKey(item._id, item.selectedOptions) === key ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    decrementItem,
    clearCart,
  };
}
