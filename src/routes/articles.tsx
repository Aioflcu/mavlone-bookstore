import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { ARTICLES } from "@/lib/articles";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/articles")({
  head: () => ({
    meta: [
      { title: "Articles — Mavlonebook" },
      { name: "description", content: "Reading guides, habits and ideas from the Mavlonebook editorial desk." },
      { property: "og:title", content: "Articles — Mavlonebook" },
      { property: "og:description", content: "Reading guides and ideas from the Mavlonebook editorial desk." },
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Articles</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Short, practical pieces from our editorial desk — on reading better, choosing formats and
        getting more from the books you buy.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {ARTICLES.map((a) => (
          <Link
            key={a.slug}
            to="/articles/$slug"
            params={{ slug: a.slug }}
            className="group flex flex-col rounded-xl border border-border bg-card p-6 card-hover"
          >
            <p className="text-xs font-semibold tracking-[0.16em] text-brass-deep uppercase">{a.category}</p>
            <h2 className="mt-2 font-display text-xl leading-snug font-semibold group-hover:text-primary">
              {a.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>
            <p className="mt-4 inline-flex items-center gap-3 text-xs text-muted-foreground">
              {formatDate(a.date)}
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {a.readMinutes} min read
              </span>
              <span className="ml-auto inline-flex items-center gap-1 font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Read <ArrowRight className="size-3.5" />
              </span>
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
