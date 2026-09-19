import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'Pediwapp_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage no disponible - seguimos sin persistir
    }
  }, [items]);

  function addItem(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: product.promotionalPrice || product.price,
          imageUrl: (product.images && product.images[0]) || '',
          qty,
        },
      ];
    });
  }

  function updateQty(productId, qty) {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty } : i)));
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}
