import { useAtom, useAtomValue } from 'jotai';
import { cartAtom, cartItemCountAtom, cartTotalAtom } from '../lib/cart-store';

interface AddItemInput {
  _id: string;
  name: string;
  price: number;
  photo?: string;
}

export function useCart() {
  const [items, setItems] = useAtom(cartAtom);
  const total = useAtomValue(cartTotalAtom);
  const itemCount = useAtomValue(cartItemCountAtom);

  const addItem = (product: AddItemInput, quantity = 1) => {
    if (quantity <= 0) {
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item));
      }

      return [...prev, { ...product, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const decrementItem = (productId: string) => {
    setItems((prev) =>
      prev.map((item) => (item._id === productId ? { ...item, quantity: item.quantity - 1 } : item)).filter((item) => item.quantity > 0),
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
