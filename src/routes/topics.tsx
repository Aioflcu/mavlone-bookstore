import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { listCategories, listBooks } from "@/lib/public-data";
import { BookCover } from "@/components/site/BookCover";

export const Route = createFileRoute("/topics")({
  loader: async () => {
    const [categories, books] = await Promise.all([
      listCategories(),
      listBooks({ data: { limit: 60 } }),
    ]);
    return { categories, books };
  },
  head: () => ({
    meta: [
      { title: "Topics — Mavlonebook" },
      { name: "description", content: "Browse Mavlonebook by topic — health, business, self-help, technology, cookbooks and more." },
      { property: "og:title", content: "Topics — Mavlonebook" },
      { property: "og:description", content: "Browse the bookstore by topic." },
    ],
  }),
  component: TopicsPage,
});

function TopicsPage() {
  const { categories, books } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Browse by topic</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Every book sits in a topic that tells you what it's for.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const sample = books.filter((b) => b.categories?.slug === c.slug).slice(0, 3);
          return (
            <Link
              key={c.id}
              to="/topics/$slug"
              params={{ slug: c.slug }}
              className="group rounded-xl border border-border bg-card p-5 card-hover"
            >
              <h2 className="font-display text-xl font-semibold group-hover:text-primary">{c.name}</h2>
              {c.description && <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>}
              <div className="mt-4 flex gap-3">
                {sample.map((b) => (
                  <div key={b.id} className="h-24 w-16 shrink-0 overflow-hidden rounded-md">
                    <BookCover book={b} />
                  </div>
                ))}
              </div>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                {books.filter((b) => b.categories?.slug === c.slug).length} books
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
