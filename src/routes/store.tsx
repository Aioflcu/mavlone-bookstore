import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Search } from "lucide-react";
import { BookGrid } from "@/components/site/BookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listBooks, listCategories, type BookFilters } from "@/lib/public-data";

const searchSchema = z.object({
  format: z.enum(["ebook", "paperback", "audiobook"]).optional(),
  category: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["newest", "rating", "price_asc", "price_desc"]).optional(),
});

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

const FORMATS = [
  { value: undefined, label: "All formats" },
  { value: "ebook", label: "Ebooks" },
  { value: "paperback", label: "Paperbacks" },
  { value: "audiobook", label: "Audiobooks" },
] as const;

export const Route = createFileRoute("/store")({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { format, category, q, sort } }) => ({ format, category, q, sort }),
  loader: async ({ deps }) => {
    const [books, categories] = await Promise.all([
      listBooks({
        data: {
          format: deps.format,
          category: deps.category,
          q: deps.q,
          sort: deps.sort,
          limit: 60,
        },
      }),
      listCategories(),
    ]);
    return { books, categories };
  },
  head: () => ({
    meta: [
      { title: "Bookstore — Mavlonebook" },
      {
        name: "description",
        content: "Browse every ebook, paperback and audiobook in the Mavlonebook store. Filter by topic, format and price.",
      },
      { property: "og:title", content: "Bookstore — Mavlonebook" },
      { property: "og:description", content: "Browse every ebook, paperback and audiobook in the Mavlonebook store." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { books, categories } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/store" });

  function setSearch(patch: Partial<typeof search>) {
    navigate({ search: (prev) => ({ ...prev, ...patch }) });
  }

  const activeCategory = categories.find((c) => c.slug === search.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {activeCategory ? activeCategory.name : search.q ? `Results for “${search.q}”` : "The Mavlonebook store"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {activeCategory?.description ??
            "Every book in one place — instant ebooks, printed paperbacks from our partner press, and audiobooks for listening."}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-7">
          <div>
            <h2 className="mb-2 text-xs font-semibold tracking-[0.14em] uppercase text-muted-foreground">
              Search
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem("q") as HTMLInputElement) ?? null;
                setSearch({ q: input?.value || undefined });
              }}
              className="relative"
            >
              <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={search.q ?? ""}
                placeholder="Title, author…"
                className="pl-9"
              />
            </form>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold tracking-[0.14em] uppercase text-muted-foreground">
              Format
            </h2>
            <div className="flex flex-col gap-1">
              {FORMATS.map((f) => (
                <button
                  key={f.label}
                  onClick={() => setSearch({ format: f.value })}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                    (search.format ?? undefined) === f.value && "bg-secondary font-semibold text-primary",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold tracking-[0.14em] uppercase text-muted-foreground">
              Topics
            </h2>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setSearch({ category: undefined })}
                className={cn(
                  "rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                  !search.category && "bg-secondary font-semibold text-primary",
                )}
              >
                All topics
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSearch({ category: c.slug })}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-secondary",
                    search.category === c.slug && "bg-secondary font-semibold text-primary",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{books.length} books</p>
            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <Button
                  key={s.value}
                  size="sm"
                  variant={(search.sort ?? "newest") === s.value ? "default" : "outline"}
                  onClick={() => setSearch({ sort: s.value })}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
          <BookGrid books={books} className="xl:grid-cols-4" />
        </div>
      </div>
    </div>
  );
}
