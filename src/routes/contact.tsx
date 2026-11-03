import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContact } from "@/server/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — Mavlonebook" },
      { name: "description", content: "Questions about an order, a refund or your Mavlonebook library? Write to us." },
      { property: "og:title", content: "Contact us — Mavlonebook" },
      { property: "og:description", content: "Get in touch with the Mavlonebook team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submitContact({ data: form });
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your message");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Talk to us</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Whether it's a missing download, a refund question, a bulk order for your team or just a
          book you wish we stocked — we read everything.
        </p>
        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <MessageSquare className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-semibold">Order & refund help</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Include your order number or payment reference for the fastest reply. We answer
                within one business day.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Mail className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-semibold">Everything else</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Partnerships, press, permissions and suggestions — same form, same inbox.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        {sent ? (
          <div className="py-10 text-center">
            <p className="font-display text-xl font-semibold">Message sent</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Thanks for writing — we'll reply to {form.email} shortly.
            </p>
            <Button variant="outline" className="mt-6" asChild>
              <Link to="/store">Back to the store</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="c-name">Your name</Label>
              <Input
                id="c-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="c-email">Email</Label>
              <Input
                id="c-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="c-message">Message</Label>
              <Textarea
                id="c-message"
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1"
                placeholder="How can we help?"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
