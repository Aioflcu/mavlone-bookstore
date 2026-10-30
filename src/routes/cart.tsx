import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { BookCover } from "@/components/site/BookCover";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/site/cart";
import { formatPrice, FORMAT_LABELS } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Mavlonebook" },
      { name: "description", content: "Review your cart and continue to secure checkout on Mavlonebook." },
      { property: "og:title", content: "Your cart — Mavlonebook" },
      { property: "og:description", content: "Review your cart and continue to secure checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal, count, clear, hasPhysical, ready } = useCart();
  const navigate = useNavigate();

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingBasket className="mx-auto size-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill it with something worth reading — instant ebooks, paperbacks and audiobooks.
        </p>
        <Button className="mt-6" size="lg" asChild>
          <Link to="/store">
            Browse the store <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Your cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {count} item{count === 1 ? "" : "s"}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={`${item.bookId}-${item.format}`} className="flex gap-4 py-5">
              <Link
                to="/books/$slug"
                params={{ slug: item.slug }}
                className="h-28 w-20 shrink-0 overflow-hidden rounded-md"
              >
                {item.coverUrl ? (
                  <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <BookCover
                    book={{
                      cover_url: null,
                      title: item.title,
                      author: item.author,
                      slug: item.slug,
                    }}
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  to="/books/$slug"
                  params={{ slug: item.slug }}
                  className="font-display font-semibold hover:text-primary"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-muted-foreground">{item.author}</p>
                <span className="mt-1 w-fit rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase">
                  {FORMAT_LABELS[item.format]}
                </span>
                <div className="mt-auto flex items-center gap-3">
                  {item.format === "paperback" ? (
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        className="p-1.5 hover:bg-secondary"
                        onClick={() => setQty(item.bookId, item.format, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">{item.qty}</span>
                      <button
                        className="p-1.5 hover:bg-secondary"
                        onClick={() => setQty(item.bookId, item.format, item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Digital · 1 copy</span>
                  )}
                  <button
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => remove(item.bookId, item.format)}
                  >
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              </div>
              <p className="font-semibold">{formatPrice(item.price * item.qty)}</p>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-semibold">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {hasPhysical ? "Shipping" : "Delivery"}
              </dt>
              <dd>{hasPhysical ? "Calculated at partner checkout" : "Instant · Free"}</dd>
            </div>
          </dl>
          <Button className="mt-5 w-full" size="lg" onClick={() => navigate({ to: "/checkout" })}>
            Secure checkout <ArrowRight className="size-4" />
          </Button>
          <Button variant="ghost" className="mt-2 w-full text-xs" onClick={clear}>
            Clear cart
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Payments are processed securely. Ebooks are delivered instantly after payment.
          </p>
        </aside>
      </div>
    </div>
  );
}
