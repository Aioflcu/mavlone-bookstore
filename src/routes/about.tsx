import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Globe2, HandHeart, Zap } from "lucide-react";
import aboutImage from "@/assets/about-books.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — Mavlonebook" },
      {
        name: "description",
        content:
          "Mavlonebook is an independent bookstore delivering ebooks instantly worldwide and shipping print editions through a partner press.",
      },
      { property: "og:title", content: "About us — Mavlonebook" },
      { property: "og:description", content: "An independent bookstore built for readers everywhere." },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Zap,
    title: "Instant, always",
    text: "Every ebook lands in your library the second your payment clears. No waiting, no expiring links.",
  },
  {
    icon: HandHeart,
    title: "Curation over noise",
    text: "We'd rather stock two hundred books worth finishing than two hundred thousand worth scrolling.",
  },
  {
    icon: Globe2,
    title: "Built for everywhere",
    text: "Readers on every continent, prices in dollars, print editions shipped worldwide from our partner press.",
  },
  {
    icon: BookOpen,
    title: "Readers first",
    text: "Fair refunds, re-downloadable purchases and human support. The bookstore we wanted to buy from.",
  },
];

function AboutPage() {
  return (
    <div>
      <section className="paper-texture border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h1 className="max-w-2xl font-display text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
            A bookstore built for people who are going places
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Mavlonebook started with a simple frustration: good, practical books were hard to get
            quickly and easy to lose. So we built a store where every purchase stays yours — ebooks
            delivered in seconds, kept forever in your library, and printed editions shipped by a
            partner press we trust.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
            <img
              src={aboutImage}
              alt="A stack of hardcover books beside a reading lamp"
              loading="lazy"
              width={1024}
              height={1024}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">How the store works</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">Ebooks and audiobooks</strong> are delivered
                digitally. Pay, and they're in your Mavlonebook library instantly — download again
                anytime, on any device, at no extra cost.
              </p>
              <p>
                <strong className="text-foreground">Print books</strong> are produced and shipped by
                our partner press. You order here, we pass the job to the press, and your paperbacks
                arrive anywhere in the world, typically in five to twelve working days.
              </p>
              <p>
                <strong className="text-foreground">Payments</strong> run through secure card
                checkout, in US dollars, with your banking app, card or transfer — whatever your
                region supports.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="font-display text-2xl font-bold tracking-tight">What we stand for</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-5">
                <v.icon className="size-5 text-primary" aria-hidden />
                <h3 className="mt-3 font-display font-semibold">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold">Questions? We're a message away.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Order issues, refund requests, bulk licensing for a team or school — write to us.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/contact">Contact us</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/store">Browse the store</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
