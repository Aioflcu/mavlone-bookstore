import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartFormat = "ebook" | "paperback" | "audiobook";

export interface CartItem {
  bookId: string;
  slug: string;
  title: string;
  author: string;
  format: CartFormat;
  price: number;
  coverUrl: string | null;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (bookId: string, format: CartFormat) => void;
  setQty: (bookId: string, format: CartFormat, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  hasPhysical: boolean;
  ready: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mavlonebook.cart.v1";

function sameItem(a: CartItem, bookId: string, format: CartFormat) {
  return a.bookId === bookId && a.format === format;
}

const FORMATS = ["ebook", "paperback", "audiobook"] as const;

function isCartItem(i: unknown): i is CartItem {
  if (typeof i !== "object" || i === null) return false;
  const c = i as Record<string, unknown>;
  return (
    typeof c.bookId === "string" &&
    typeof c.slug === "string" &&
    typeof c.title === "string" &&
    typeof c.author === "string" &&
    typeof c.price === "number" &&
    typeof c.qty === "number" &&
    (FORMATS as readonly unknown[]).includes(c.format)
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed
              .filter(isCartItem)
              .map((i) => ({ ...i, coverUrl: i.coverUrl ?? null })),
          );
        }
      }
    } catch {
      // ignore corrupted cart data
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
    const hasPhysical = items.some((i) => i.format === "paperback");
    return {
      items,
      ready,
      count,
      subtotal,
      hasPhysical,
      add: (item, qty = 1) =>
        setItems((prev) => {
          const idx = prev.findIndex((i) => sameItem(i, item.bookId, item.format));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], qty: next[idx].qty + qty };
            return next;
          }
          return [...prev, { ...item, qty }];
        }),
      remove: (bookId, format) => setItems((prev) => prev.filter((i) => !sameItem(i, bookId, format))),
      setQty: (bookId, format, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => !sameItem(i, bookId, format))
            : prev.map((i) => (sameItem(i, bookId, format) ? { ...i, qty } : i)),
        ),
      clear: () => setItems([]),
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
