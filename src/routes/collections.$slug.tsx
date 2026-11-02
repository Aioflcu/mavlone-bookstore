import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BookGrid } from "@/components/site/BookCard";
import { getCollection } from "@/server/public-data";

export const Route = createFileRoute("/collections/$slug")({
  loader: ({ params }) => {
    const data = getCollection({ data: { slug: params.slug } });
    if (!data.collection) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData.collection?.title ?? "Collection"} — Mavlonebook` },
      { name: "description", content: loaderData.collection?.description ?? "A curated book collection on Mavlonebook." },
      { property: "og:title", content: loaderData.collection?.title ?? "Collection" },
      { property: "og:description", content: loaderData.collection?.description ?? "" },
    ],
  }),
  notFoundComponent: () => <p className="px-4 py-24 text-center text-sm">Collection not found.</p>,
  component: CollectionPage,
});

function CollectionPage() {
  const { collection, books } = Route.useLoaderData();
  return (
    <div>
      <section className="ink-panel">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <nav className="text-xs opacity-70" aria-label="Breadcrumb">
            <Link to="/" className="hover:underline">Home</Link> /{" "}
            <Link to="/collections" className="hover:underline">Collections</Link>
          </nav>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-3 max-w-2xl text-sm opacity-85 sm:text-base">{collection.description}</p>
          )}
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-10">
        {books.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No books in this collection yet.
          </p>
        ) : (
          <BookGrid books={books} />
        )}
        <p className="mt-10 text-center text-sm">
          <Link to="/collections" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
            <ArrowRight className="size-4" /> All collections
          </Link>
        </p>
      </div>
    </div>
  );
}
