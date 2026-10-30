import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Audiobook,
  Download,
  Globe2,
  LibraryBig,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import heroImage from "@/assets/hero-library.jpg";
import { BookCover, BookGrid } from "@/components/site/BookCard";
import { Rating } from "@/components/site/BookCard";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { getHomeData } from "@/server/public-data";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () => ({
    meta: [
      { title: "Mavlonebook — Books that move you forward" },
      {
        name: "description",
        content:
          "Discover ebooks, paperbacks and audiobooks on Mavlonebook. Instant ebook delivery worldwide, print books shipped by our partner press.",
      },
      { property: "og:title", content: "Mavlonebook — Books that move you forward" },
      {
        property: "og:description",
        content: "Ebooks delivered instantly, print editions shipped worldwide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-brass-deep uppercase">{eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {action && (
        <Link
          to={action.to}
          className="group hidden items-center gap-1 text-sm font-semibold text-primary sm:inline-flex"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function Home() {
  const { featured, bestsellers, newReleases, audiobooks, categories, collections } =
    Route.useLoaderData();
  const spotlight = featured[0];
  const restFeatured = featured.slice(1);

  return (
    <div>
      {/* Hero */}
      <section className="paper-texture border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-brass-deep">
              <Sparkles className="size-3.5" aria-hidden /> The Mavlonebook Bookstore
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Get knowledge for <span className="text-primary italic">growth</span> — one great book
              at a time
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Discover practical books, ideas and guides that move you forward. Ebooks arrive in
              your library the moment you pay. Paperbacks ship worldwide from our partner press.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/store">
                  Explore books <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/audiobooks">
                  <Audiobook className="size-4" /> Browse audiobooks
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Download className="size-4 text-primary" /> Instant ebook delivery
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" /> Secure checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="size-4 text-primary" /> Ships worldwide
              </span>
            </div>
          </div>
          <div className="relative animate-fade-up">
            <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
              <img
                src={heroImage}
                alt="A warm, book-lined reading room"
                width={1024}
                height={1024}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            {spotlight && (
              <Link
                to="/books/$slug"
                params={{ slug: spotlight.slug }}
                className="absolute -bottom-5 left-4 flex w-64 items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg card-hover sm:left-8"
              >
                <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md">
                  <BookCover book={spotlight} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-brass-deep uppercase">
                    Book of the week
                  </p>
                  <p className="mt-0.5 truncate font-display text-sm font-semibold">
                    {spotlight.title}
                  </p>
                  <Rating value={spotlight.rating} count={spotlight.ratings_count} />
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="scroll-x flex gap-2.5 pb-1">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/topics/$slug"
              params={{ slug: c.slug }}
              className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-secondary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-4">
          <SectionHeading
            eyebrow="Editors' picks"
            title="Featured this week"
            action={{ to: "/store", label: "Explore all books" }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {restFeatured.slice(0, 4).map((b) => (
              <Link
                key={b.id}
                to="/books/$slug"
                params={{ slug: b.slug }}
                className="group flex gap-4 rounded-xl border border-border bg-card p-4 card-hover"
              >
                <div className="h-36 w-24 shrink-0 overflow-hidden rounded-md">
                  <BookCover book={b} />
                </div>
                <div className="flex min-w-0 flex-col">
                  <h3 className="font-display text-sm leading-snug font-semibold line-clamp-3 group-hover:text-primary">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">{b.author}</p>
                  <div className="mt-auto">
                    <Rating value={b.rating} count={b.ratings_count} />
                    <p className="mt-1 text-sm font-bold text-primary">
                      {formatPrice(b.price_ebook ?? b.price_print ?? b.price_audio)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New releases */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading
          eyebrow="Fresh off the press"
          title="New releases"
          action={{ to: "/store", label: "See what's new" }}
        />
        <BookGrid books={newReleases} />
      </section>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <SectionHeading
            eyebrow="Curated sets"
            title="Collections worth your shelf"
            action={{ to: "/collections", label: "All collections" }}
          />
          <div className="grid gap-5 md:grid-cols-2">
            {collections.map((c) => (
              <Link
                key={c.id}
                to="/collections/$slug"
                params={{ slug: c.slug }}
                className="ink-panel group relative overflow-hidden rounded-2xl p-8"
              >
                <p className="text-xs font-semibold tracking-[0.18em] text-brass uppercase">
                  Collection
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-balance">{c.title}</h3>
                <p className="mt-2 max-w-md text-sm opacity-85">{c.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brass">
                  Browse the set
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="border-y border-border bg-secondary/60">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <SectionHeading
              eyebrow="Reader favorites"
              title="Bestsellers"
              action={{ to: "/store", label: "Shop bestsellers" }}
            />
            <BookGrid books={bestsellers} />
          </div>
        </section>
      )}

      {/* Audiobooks teaser */}
      {audiobooks.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <SectionHeading
            eyebrow="Listen while you live"
            title="From the audiobook library"
            action={{ to: "/audiobooks", label: "All audiobooks" }}
          />
          <BookGrid books={audiobooks} />
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-6">
        <div className="ink-panel flex flex-col items-center gap-4 rounded-2xl px-6 py-12 text-center">
          <LibraryBig className="size-8 text-brass" aria-hidden />
          <h2 className="max-w-2xl font-display text-2xl font-bold text-balance sm:text-3xl">
            Start your library today
          </h2>
          <p className="max-w-xl text-sm opacity-85">
            Create a free account to keep every purchase, re-download your ebooks anytime, and get
            first access to new releases.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button variant="brass" size="lg" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Create free account
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/store">Browse the store</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
