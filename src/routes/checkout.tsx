import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Lock, MapPin, ShoppingBasket } from "lucide-react";
import { BookCover } from "@/components/site/BookCover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/site/cart";
import { useSession } from "@/hooks/use-session";
import { formatPrice, FORMAT_LABELS } from "@/lib/format";
import { createCheckout } from "@/server/checkout";

export const Route = createFileRoute("/checkout")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Secure checkout — Mavlonebook" },
      { name: "description", content: "Complete your purchase securely on Mavlonebook." },
      { property: "og:title", content: "Secure checkout — Mavlonebook" },
      { property: "og:description", content: "Complete your purchase securely on Mavlonebook." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, hasPhysical, count, clear, ready } = useCart();
  const { session, user, loading } = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [shipping, setShipping] = useState({ name: "", address: "", city: "", country: "" });

  if (!ready || loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingBasket className="mx-auto size-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 font-display text-3xl font-bold">Nothing to check out</h1>
        <Button className="mt-6" asChild>
          <Link to="/store">Browse the store</Link>
        </Button>
      </div>
    );
  }

  const signedIn = !!session && !!user;

  async function pay() {
    if (!signedIn) return;
    if (hasPhysical && (!shipping.name || !shipping.address || !shipping.city || !shipping.country)) {
      toast.error("Please add the delivery address for your print books");
      return;
    }
    setBusy(true);
    try {
      const result = await createCheckout({
        data: {
          items: items.map((i) => ({ bookId: i.bookId, format: i.format, qty: i.qty })),
          shipping: hasPhysical ? shipping : undefined,
        },
      });
      if (!result.configured) {
        toast.error(
          "Online payments are not connected yet. The store owner needs to add Paystack keys — your cart is saved.",
        );
        return;
      }
      if (result.authorizationUrl) {
        clear();
        window.location.href = result.authorizationUrl;
        return;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center gap-2">
        <Lock className="size-4 text-primary" aria-hidden />
        <h1 className="font-display text-3xl font-bold tracking-tight">Secure checkout</h1>
      </div>

      {!signedIn ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-xl font-semibold">Sign in to complete your purchase</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Your ebooks are delivered to your account library, so a sign-in keeps every purchase safe
            and re-downloadable.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate({ to: "/auth", search: { next: "/checkout" } })}
            >
              Sign in to pay
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: "/auth", search: { mode: "signup", next: "/checkout" } })}
            >
              Create account
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {hasPhysical && (
              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <MapPin className="size-4 text-primary" aria-hidden /> Delivery address
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your cart contains print books, shipped worldwide by our partner press.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      ["name", "Full name"],
                      ["country", "Country"],
                      ["address", "Address"],
                      ["city", "City"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                      <Label htmlFor={key}>{label}</Label>
                      <Input
                        id={key}
                        value={shipping[key]}
                        onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="font-display text-lg font-semibold">Your order</h2>
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
                {items.map((item) => (
                  <li key={`${item.bookId}-${item.format}`} className="flex items-center gap-3 p-3">
                    <div className="h-16 w-11 shrink-0 overflow-hidden rounded">
                      {item.coverUrl ? (
                        <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <BookCover
                          book={{ cover_url: null, title: item.title, author: item.author, slug: item.slug }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {FORMAT_LABELS[item.format]}
                        {item.qty > 1 ? ` · ×${item.qty}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(item.price * item.qty)}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="h-fit rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Payment</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Items ({count})</dt>
                <dd className="font-semibold">{formatPrice(subtotal)}</dd>
              </div>
              {hasPhysical ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Print shipping</dt>
                  <dd className="text-xs text-muted-foreground">Billed by partner press</dd>
                </div>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd>Instant · Free</dd>
                </div>
              )}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-bold">{formatPrice(subtotal)}</dd>
                </div>
              </div>
            </dl>
            <Button className="mt-5 w-full" size="lg" onClick={pay} disabled={busy}>
              <CreditCard className="size-4" /> {busy ? "Redirecting…" : "Pay with card"}
            </Button>
            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              You'll be redirected to a secure payment page and returned here automatically. Ebook
              downloads unlock the moment payment is confirmed.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
