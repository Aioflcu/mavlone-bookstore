import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { listCollections } from "@/server/public-data";

export const Route = createFileRoute("/collections")({
  loader: () => listCollections(),
  head: () => ({
    meta: [
      { title: "Collections — Mavlonebook" },
      { name: "description", content: "Curated book collections on Mavlonebook — bundles picked around one goal." },
      { property: "og:title", content: "Collections — Mavlonebook" },
      { property: "og:description", content: "Curated book collections on Mavlonebook." },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const collections = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Collections</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Sets of books picked around one goal — eat better, lead better, grow faster.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {collections.map((c) => (
          <Link
            key={c.id}
            to="/collections/$slug"
            params={{ slug: c.slug }}
            className="ink-panel group rounded-2xl p-8"
          >
            <p className="text-xs font-semibold tracking-[0.18em] text-brass uppercase">Collection</p>
            <h2 className="mt-2 font-display text-2xl font-bold">{c.title}</h2>
            {c.description && <p className="mt-2 max-w-md text-sm opacity-85">{c.description}</p>}
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brass">
              Browse the set <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
