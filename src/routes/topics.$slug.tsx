import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookGrid } from "@/components/site/BookCard";
import { listBooks, listCategories } from "@/server/public-data";

export const Route = createFileRoute("/topics/$slug")({
  loader: async ({ params }) => {
    const [categories, books] = await Promise.all([
      listCategories(),
      listBooks({ data: { category: params.slug, limit: 60 } }),
    ]);
    const category = categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { category, books };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.category?.name ?? "Topic"} books — Mavlonebook` },
      { name: "description", content: loaderData?.category?.description ?? `Browse ${loaderData?.category?.name ?? "this topic"} books on Mavlonebook.` },
      { property: "og:title", content: `${loaderData?.category?.name ?? "Topic"} — Mavlonebook` },
      { property: "og:description", content: loaderData?.category?.description ?? "" },
    ],
  }),
  notFoundComponent: () => <p className="px-4 py-24 text-center text-sm">Topic not found.</p>,
  component: TopicPage,
});

function TopicPage() {
  const { category, books } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <Link to="/topics" className="hover:text-foreground">Topics</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{category.description}</p>}
      <div className="mt-8">
        <BookGrid books={books} />
      </div>
    </div>
  );
}
