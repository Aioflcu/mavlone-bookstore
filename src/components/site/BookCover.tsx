import { cn } from "@/lib/utils";
import type { BookRow } from "@/server/public-data";

/**
 * Typographic cover used when a book has no uploaded cover image yet.
 * Palette is selected deterministically so covers stay stable per book.
 */
const PALETTES = [
  { bg: "var(--cover-pine)", fg: "var(--cover-paper)", rule: "var(--brass)" },
  { bg: "var(--cover-terra)", fg: "var(--cover-paper)", rule: "var(--cover-paper)" },
  { bg: "var(--cover-ink)", fg: "var(--cover-paper)", rule: "var(--brass)" },
  { bg: "var(--cover-brass)", fg: "var(--cover-ink)", rule: "var(--cover-ink)" },
  { bg: "var(--cover-slate)", fg: "var(--cover-paper)", rule: "var(--brass)" },
  { bg: "var(--cover-olive)", fg: "var(--cover-paper)", rule: "var(--cover-paper)" },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function BookCover({
  book,
  className,
}: {
  book: Pick<BookRow, "cover_url" | "title" | "author" | "slug">;
  className?: string;
}) {
  if (book.cover_url) {
    return (
      <img
        src={book.cover_url}
        alt={`Cover of ${book.title}`}
        loading="lazy"
        width={600}
        height={900}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  const p = PALETTES[hashString(book.slug) % PALETTES.length];
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-between overflow-hidden p-4 cover-shadow relative",
        className,
      )}
      style={{ backgroundColor: p.bg, color: p.fg }}
      role="img"
      aria-label={`Cover of ${book.title}`}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-2 opacity-30"
        style={{ background: "linear-gradient(to right, rgb(0 0 0 / .45), transparent)" }}
      />
      <div>
        <div className="mb-2 h-[3px] w-8" style={{ backgroundColor: p.rule }} />
        <p className="font-display text-lg leading-snug font-semibold text-balance line-clamp-4">
          {book.title}
        </p>
      </div>
      <p className="text-[11px] tracking-[0.14em] uppercase opacity-85 line-clamp-1">{book.author}</p>
    </div>
  );
}
