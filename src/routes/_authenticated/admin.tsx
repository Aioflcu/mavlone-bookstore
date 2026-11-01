import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Lock, LayoutDashboard, BookOpen, Package, Tags } from "lucide-react";
import { isAdmin } from "@/server/checkout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  loader: () => isAdmin(),
  head: () => ({
    meta: [
      { title: "Admin — Mavlonebook" },
      { name: "description", content: "Mavlonebook store administration." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/books", label: "Books", icon: BookOpen, exact: false },
  { to: "/admin/orders", label: "Orders", icon: Package, exact: false },
  { to: "/admin/catalog", label: "Topics & collections", icon: Tags, exact: false },
] as const;

function AdminLayout() {
  const admin = Route.useLoaderData();

  if (!admin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Lock className="mx-auto size-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 font-display text-2xl font-bold">Admin access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This dashboard is restricted to store administrators. Ask an existing admin to add your
          email to the admin list.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
          Back to the store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Store dashboard</h1>
      <nav className="mt-6 flex flex-wrap gap-1 border-b border-border" aria-label="Admin">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={cn(
              "flex items-center gap-2 rounded-t-md px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground",
              "[&.active]:border-b-2 [&.active]:border-primary [&.active]:text-primary",
            )}
            activeProps={{ className: "border-b-2 border-primary text-primary" }}
            activeOptions={{ exact: t.exact }}
          >
            <t.icon className="size-4" /> {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
