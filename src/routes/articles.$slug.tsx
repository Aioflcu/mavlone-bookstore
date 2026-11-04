import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { getArticle, ARTICLES } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/articles/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article, more: ARTICLES.filter((a) => a.slug !== params.slug).slice(0, 2) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.article?.title ?? "Article"} — Mavlonebook` },
      { name: "description", content: loaderData?.article?.excerpt ?? "An article from Mavlonebook." },
      { property: "og:title", content: loaderData?.article?.title ?? "Article" },
      { property: "og:description", content: loaderData?.article?.excerpt ?? "" },
      { property: "og:type", content: "article" },
    ],
  }),
  notFoundComponent: () => <p className="px-4 py-24 text-center text-sm">Article not found.</p>,
  component: ArticlePage,
});

function ArticlePage() {
  const { article, more } = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <Link to="/articles" className="hover:text-foreground">Articles</Link>
      </nav>
      <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-brass-deep uppercase">{article.category}</p>
      <h1 className="mt-2 font-display text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">
        {article.title}
      </h1>
      <p className="mt-3 inline-flex items-center gap-3 text-xs text-muted-foreground">
        {formatDate(article.date)}
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" /> {article.readMinutes} min read
        </span>
      </p>
      <p className="mt-6 border-l-2 border-brass pl-4 font-display text-lg leading-relaxed text-foreground/90 italic">
        {article.excerpt}
      </p>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/90">
        {article.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-12 rounded-xl border border-border bg-secondary/60 p-6 text-center">
        <p className="font-display text-lg font-semibold">Put it into practice tonight</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The books behind these ideas are in the store — many under $10 today.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/store">Browse the store</Link>
        </Button>
      </div>
      <div className="mt-12">
        <h2 className="font-display text-xl font-semibold">Keep reading</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {more.map((a) => (
            <Link
              key={a.slug}
              to="/articles/$slug"
              params={{ slug: a.slug }}
              className="rounded-xl border border-border bg-card p-4 hover:bg-secondary/50"
            >
              <p className="font-display font-semibold leading-snug">{a.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.excerpt}</p>
            </Link>
          ))}
        </div>
        <Link
          to="/articles"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> All articles
        </Link>
      </div>
    </article>
  );
}
