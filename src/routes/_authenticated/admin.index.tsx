import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, DollarSign, Package, Clock } from "lucide-react";
import { getAdminOverview } from "@/lib/admin";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: () => getAdminOverview(),
  component: AdminOverview,
});

function AdminOverview() {
  const stats = Route.useLoaderData();
  const cards = [
    { label: "Books in catalog", value: String(stats.bookCount), icon: BookOpen },
    { label: "Orders", value: String(stats.orderCount), icon: Package },
    { label: "Awaiting payment", value: String(stats.pendingCount), icon: Clock },
    { label: "Paid revenue", value: formatPrice(stats.revenue), icon: DollarSign },
  ];
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5">
            <c.icon className="size-5 text-primary" aria-hidden />
            <p className="mt-3 font-display text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/books"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Add a new book
          </Link>
          <Link
            to="/admin/orders"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Review orders
          </Link>
          <Link
            to="/admin/catalog"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Manage topics & collections
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          To give someone admin access, have them create an account, then add their email in
          Topics & collections → Admins.
        </p>
      </div>
    </div>
  );
}
