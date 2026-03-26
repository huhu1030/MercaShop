import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export interface CartItemSelectedOption {
  name: string;
  choices: Array<{ name: string; quantity: number; extraPrice: number }>;
}

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  photo?: string;
  selectedOptions?: CartItemSelectedOption[];
  optionsTotalPrice?: number;
}

const memoryStorage = new Map<string, string>();

function getBrowserStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  const storage = window.localStorage;
  if (storage && typeof storage.getItem === 'function' && typeof storage.setItem === 'function' && typeof storage.removeItem === 'function') {
    return storage;
  }

  return null;
}

const cartStorageBackend = {
  getItem: (key: string) => {
    const browserStorage = getBrowserStorage();
    return browserStorage ? browserStorage.getItem(key) : (memoryStorage.get(key) ?? null);
  },
  setItem: (key: string, value: string) => {
    const browserStorage = getBrowserStorage();
    if (browserStorage) {
      browserStorage.setItem(key, value);
      return;
    }

    memoryStorage.set(key, value);
  },
  removeItem: (key: string) => {
    const browserStorage = getBrowserStorage();
    if (browserStorage) {
      browserStorage.removeItem(key);
      return;
    }

    memoryStorage.delete(key);
  },
};

const cartStorage = createJSONStorage<CartItem[]>(() => cartStorageBackend);

export function resetCartStorage() {
  memoryStorage.clear();
  const browserStorage = getBrowserStorage();
  browserStorage?.removeItem('mercashop-cart');
}

export const cartAtom = atomWithStorage<CartItem[]>('mercashop-cart', [], cartStorage);

export const cartTotalAtom = atom((get) => {
  const items = get(cartAtom);
  return items.reduce((sum, item) => sum + (item.price + (item.optionsTotalPrice ?? 0)) * item.quantity, 0);
});

export const cartItemCountAtom = atom((get) => {
  const items = get(cartAtom);
  return items.reduce((sum, item) => sum + item.quantity, 0);
});
