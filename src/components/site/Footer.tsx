import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitContact } from "@/server/contact";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { to: "/store", label: "All books" },
      { to: "/store", label: "Ebooks", search: { format: "ebook" } },
      { to: "/store", label: "Paperbacks", search: { format: "paperback" } },
      { to: "/audiobooks", label: "Audiobooks" },
      { to: "/collections", label: "Collections" },
    ] as { to: string; label: string; search?: Record<string, string> }[],
  },
  {
    title: "Explore",
    links: [
      { to: "/topics", label: "Topics" },
      { to: "/articles", label: "Articles" },
      { to: "/about", label: "About us" },
      { to: "/contact", label: "Contact" },
    ] as { to: string; label: string }[],
  },
  {
    title: "Help",
    links: [
      { to: "/privacy-policy", label: "Privacy policy" },
      { to: "/refund-policy", label: "Refund policy" },
      { to: "/terms-conditions", label: "Terms & conditions" },
      { to: "/contact", label: "Support" },
    ] as { to: string; label: string }[],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await submitContact({
        data: { name: "Newsletter", email, message: "Subscribe to the reading list newsletter" },
      });
      toast.success("You're on the list. Watch your inbox for new arrivals.");
      setEmail("");
    } catch {
      toast.error("Could not subscribe — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="ink-panel mt-20">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
                <BookOpen className="size-5" aria-hidden />
              </span>
              <span className="font-display text-lg font-bold">Mavlonebook</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed opacity-80">
              Books that move you forward. Ebooks delivered instantly, print editions shipped by our
              partner press, and audiobooks for every commute.
            </p>
            <form onSubmit={subscribe} className="mt-5 flex max-w-sm gap-2">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button type="submit" variant="brass" disabled={busy}>
                {busy ? "…" : "Join"}
              </Button>
            </form>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold tracking-[0.16em] uppercase opacity-70">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      search={("search" in l ? l.search : undefined) as never}
                      className="text-sm opacity-85 transition-opacity hover:opacity-100 hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/15 pt-6 text-xs opacity-70 sm:flex-row">
          <p>© {new Date().getFullYear()} Mavlonebook. All rights reserved.</p>
          <p>Secure checkout · Paystack · Worldwide delivery</p>
        </div>
      </div>
    </footer>
  );
}
