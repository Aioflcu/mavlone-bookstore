import { createFileRoute, Link } from "@tanstack/react-router";
import { Headphones } from "lucide-react";
import { BookGrid } from "@/components/site/BookCard";
import { Button } from "@/components/ui/button";
import { listBooks } from "@/lib/public-data";

export const Route = createFileRoute("/audiobooks")({
  loader: () => listBooks({ data: { format: "audiobook", limit: 60 } }),
  head: () => ({
    meta: [
      { title: "Audiobook library — Mavlonebook" },
      { name: "description", content: "Listen on the go — the Mavlonebook audiobook library of practical, well-narrated books." },
      { property: "og:title", content: "Audiobook library — Mavlonebook" },
      { property: "og:description", content: "The Mavlonebook audiobook library." },
    ],
  }),
  component: AudiobooksPage,
});

function AudiobooksPage() {
  const books = Route.useLoaderData();
  return (
    <div>
      <section className="ink-panel">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center">
          <Headphones className="mx-auto size-9 text-brass" aria-hidden />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            The audiobook library
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-85 sm:text-base">
            Well-narrated editions of the books readers finish most. Stream instantly in your
            library or download and listen offline.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-10">
        {books.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">New audiobooks are being prepared.</p>
            <Button className="mt-4" variant="outline" asChild>
              <Link to="/store">Browse ebooks meanwhile</Link>
            </Button>
          </div>
        ) : (
          <BookGrid books={books} />
        )}
      </div>
    </div>
  );
}
