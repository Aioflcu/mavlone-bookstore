import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Check, Download, Headphones, Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BookGrid, Rating } from "@/components/site/BookCard";
import { BookCover } from "@/components/site/BookCover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice, FORMAT_LABELS } from "@/lib/format";
import { useCart } from "@/components/site/cart";
import { getBook } from "@/lib/public-data";

export const Route = createFileRoute("/books/$slug")({
  loader: async ({ params }) => {
    const data = await getBook({ data: { slug: params.slug } });
    if (!data.book) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.book?.title ?? "Book"} — Mavlonebook` },
      {
        name: "description",
        content:
          loaderData?.book?.short_description ?? `Read ${loaderData?.book?.title ?? "this book"} on Mavlonebook.`,
      },
      { property: "og:title", content: loaderData?.book?.title ?? "Book" },
      { property: "og:description", content: loaderData?.book?.short_description ?? "" },
      { property: "og:type", content: "book" },
    ],
  }),
  notFoundComponent: () => (
    <div className="px-4 py-24 text-center">
      <p className="font-display text-4xl font-bold">Book not found</p>
      <p className="mt-2 text-sm text-muted-foreground">It may have been retired from the store.</p>
      <Button className="mt-6" asChild>
        <Link to="/store">Back to the store</Link>
      </Button>
    </div>
  ),
  component: BookDetail,
});

type FormatOption = {
  format: "ebook" | "paperback" | "audiobook";
  price: number | null;
  icon: React.ReactNode;
  note: string;
};

function BookDetail() {
  const { book: maybeBook, related } = Route.useLoaderData();
  const book = maybeBook!;
  const navigate = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const options: FormatOption[] = [
    book.formats.includes("ebook")
      ? {
          format: "ebook",
          price: book.price_ebook,
          icon: <Download className="size-4" />,
          note: "Instant download",
        }
      : null,
    book.formats.includes("paperback")
      ? {
          format: "paperback",
          price: book.price_print,
          icon: <Truck className="size-4" />,
          note: "Ships from partner press",
        }
      : null,
    book.formats.includes("audiobook")
      ? {
          format: "audiobook",
          price: book.price_audio,
          icon: <Headphones className="size-4" />,
          note: "Stream & download",
        }
      : null,
  ].filter(Boolean) as FormatOption[];

  const [selected, setSelected] = useState<FormatOption>(options[0]!);
  const selectedPrice = selected.price ?? 0;

  function addToCart() {
    if (!selected.price) return;
    add(
      {
        bookId: book.id,
        slug: book.slug,
        title: book.title,
        author: book.author,
        format: selected.format,
        price: selected.price,
        coverUrl: book.cover_url,
      },
      qty,
    );
    toast.success(`Added to cart — ${FORMAT_LABELS[selected.format]}`);
  }

  const details: [string, React.ReactNode][] = [
    ["Publisher", book.publisher],
    ["Publication date", book.publication_date],
    ["Pages", book.pages],
    ["Language", book.language],
    ["ISBN", book.isbn],
    ["Format", book.formats.map((f) => FORMAT_LABELS[f]).join(", ")],
  ].filter(([, v]) => v != null) as [string, React.ReactNode][];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="mb-8 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <Link to="/store" className="hover:text-foreground">Store</Link>
        {book.categories && (
          <>
            <span className="mx-1.5">/</span>
            <Link
              to="/topics/$slug"
              params={{ slug: book.categories.slug }}
              className="hover:text-foreground"
            >
              {book.categories.name}
            </Link>
          </>
        )}
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{book.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[340px_1fr]">
        <div>
          <div className="mx-auto aspect-[2/3] max-w-[340px] overflow-hidden rounded-xl">
            <BookCover book={book} />
          </div>
          <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm">
            <h2 className="mb-3 text-xs font-semibold tracking-[0.14em] uppercase text-muted-foreground">
              Book details
            </h2>
            <dl className="space-y-2">
              {details.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div>
          {book.categories && (
            <Link
              to="/topics/$slug"
              params={{ slug: book.categories.slug }}
              className="text-xs font-semibold tracking-[0.16em] text-brass-deep uppercase hover:underline"
            >
              {book.categories.name}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">
            {book.title}
          </h1>
          {book.subtitle && (
            <p className="mt-2 font-display text-lg text-muted-foreground italic">{book.subtitle}</p>
          )}
          <p className="mt-3 text-sm">
            by <span className="font-semibold">{book.author}</span>
          </p>
          <div className="mt-3">
            <Rating value={book.rating} count={book.ratings_count} />
          </div>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/90">
            {book.description ?? book.short_description}
          </p>

          {/* Format picker */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {options.map((opt) => (
              <button
                key={opt.format}
                onClick={() => setSelected(opt)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  selected.format === opt.format
                    ? "border-primary bg-secondary ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/50",
                )}
                aria-pressed={selected.format === opt.format}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                    {opt.icon}
                    {FORMAT_LABELS[opt.format]}
                  </span>
                  {selected.format === opt.format && (
                    <Check className="size-4 text-primary" aria-hidden />
                  )}
                </div>
                <p className="mt-2 text-lg font-bold">{formatPrice(opt.price)}</p>
                <p className="text-xs text-muted-foreground">{opt.note}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-border">
              <button
                className="p-2.5 hover:bg-secondary disabled:opacity-40"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={selected.format !== "paperback"}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button
                className="p-2.5 hover:bg-secondary disabled:opacity-40"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                disabled={selected.format !== "paperback"}
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Button size="lg" onClick={addToCart} disabled={!selected.price}>
              <ShoppingCart className="size-4" /> Add to cart · {formatPrice(selectedPrice * qty)}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                addToCart();
                navigate({ to: "/checkout" });
              }}
              disabled={!selected.price}
            >
              Buy now
            </Button>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
            {selected.format === "paperback" ? (
              <span>
                Printed books are produced and shipped by our partner press. Delivery worldwide,
                typically 5–12 working days.
              </span>
            ) : selected.format === "audiobook" ? (
              <span>Stream instantly in your library, or download and listen offline.</span>
            ) : (
              <span>
                Ebooks arrive in your Mavlonebook library the moment your payment is confirmed —
                re-download anytime, on any device.
              </span>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold">Readers also loved</h2>
          <BookGrid books={related} />
        </section>
      )}
    </div>
  );
}
