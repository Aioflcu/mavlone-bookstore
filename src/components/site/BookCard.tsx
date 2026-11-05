import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, FORMAT_LABELS } from "@/lib/format";
import { BookCover } from "./BookCover";
import type { BookWithCategory } from "@/lib/public-data";

export function Rating({ value, count }: { value: number | null; count?: number | null }) {
  const v = value ?? 0;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="size-3.5 fill-brass text-brass" aria-hidden />
      <span className="font-medium text-foreground">{v.toFixed(1)}</span>
      {count != null && <span>({count})</span>}
    </span>
  );
}

export function FormatBadge({ format }: { format: string }) {
  return (
    <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-secondary-foreground">
      {FORMAT_LABELS[format] ?? format}
    </span>
  );
}

export function BookCard({ book, className }: { book: BookWithCategory; className?: string }) {
  const price = book.price_ebook ?? book.price_print ?? book.price_audio;
  const compare = book.compare_at_ebook;
  return (
    <Link
      to="/books/$slug"
      params={{ slug: book.slug }}
      className={cn(
        "group block rounded-xl border border-border bg-card p-3 card-hover",
        className,
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
        <BookCover book={book} />
        {compare && price && compare > price ? (
          <span className="absolute top-2 right-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
            SAVE {Math.round((1 - price / compare) * 100)}%
          </span>
        ) : null}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-display text-sm leading-snug font-semibold line-clamp-2 group-hover:text-primary">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
        <div className="flex items-center justify-between pt-1">
          <Rating value={book.rating} count={book.ratings_count} />
          <div className="flex items-baseline gap-1.5">
            {compare && price && compare > price ? (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatPrice(compare)}
              </span>
            ) : null}
            <span className="text-sm font-bold text-primary">{formatPrice(price)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function BookGrid({ books, className }: { books: BookWithCategory[]; className?: string }) {
  if (books.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No books found. Try a different search or filter.
      </p>
    );
  }
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        className,
      )}
    >
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );
}
